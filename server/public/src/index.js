import { productDisplay, categoryCard, groupCard, navigationCard } from "./view.js";

async function fetchData(url, fileName) {
    try {
        const response = await fetch(url + fileName);
        const productData = await response.json();
        return productData
    } catch (error) {
        console.log(error);
    }
}


const url = "http://localhost:5555/public/data/";

// popular category displayer
async function categoryDisplayer(categoryData) {
    // this is where the body container is initialized
    const bodyContainer = document.querySelector('.content-container');
    const content = document.createElement('div');
    const popularProduct = new productDisplay("POPULAR PRODUCTS", "", "", true);
    const displayTemplate = popularProduct.render();
    const prodDisplay = displayTemplate.querySelector('.display-products');

    // 
    if (!categoryData) console.log("no category data!");
    else {
        categoryData["category-list"].forEach(category => {
            if (category.type == 'main') return;
            const categCard = new categoryCard(category.name, category.items, category.image);
            prodDisplay.appendChild(categCard.render());
        });
    }

    content.classList.toggle('content');

    content.appendChild(displayTemplate);
    bodyContainer.appendChild(content);
}

// the group displayer function 
async function groupDisplayer(name, categoryData, addData, prodData, icons) {
    const content = document.createElement('div');
    const bodyContainer = document.querySelector('.content-container');
    const categByName = [];
    const prodByName = [];
    let start = 0
    let finnish = 5

    // the category data by group name creation
    categoryData['category-list'].forEach(category => {
        if (!category.parent) return;
        if (category.parent.toLowerCase() == name.toLowerCase()) categByName.push(category)
    })

    // the products data by group name
    prodData["product-list"].forEach(product => {
        prodByName.push(product);
    })

    const group = new groupCard(name);
    const { addCardImage, addCardInfo } = group.addCardFormation(addData.title, addData.subtitle, addData.poster);
    const categoryContainer = group.groupCategoryFormation(categByName);
    const prodListing = group.productListing(prodByName.slice(start, finnish), icons);
    const groupRender = group.render(addCardImage, addCardInfo, categoryContainer, prodListing);
    content.appendChild(groupRender);

    content.classList.toggle('content');
    bodyContainer.appendChild(content);

    // product displaying controllers
    const prodGroupContainer = document.querySelector('.group-products');

    // looping through the control buttons to listen to the clicked one
    document.addEventListener('click', (event) => {
        const btn = event.target.closest('.disp-button');
        if (!btn) return;

        const move = parseInt(btn.dataset.mover);
        const step = 1;

        let newStart = start + move * step;
        let newFinish = finnish + move * step;

        if (newStart < 0) {
            newStart = 0;
            newFinish = step;
        }

        if (newFinish > prodByName.length) {
            newFinish = prodByName.length;
            newStart = prodByName.length - step;
            if (newStart < 0) newStart = 0;
        }

        if ((newFinish - newStart) < 5) return;

        start = newStart;
        finnish = newFinish;

        const oldContainer = prodGroupContainer.querySelector('.product-container');
        if (oldContainer) oldContainer.remove();

        const newProducts = prodByName.slice(start, finnish);
        prodGroupContainer.appendChild(group.productListing(newProducts, icons));

        // for view button
        const viewBtn = event.target.closest('.viewbtn');
        if (viewBtn) console.log("clicked");
    });
}

// the navigational card displayer card
async function navigationDisplayer(prodData, iconData) {
    const navCard = new navigationCard();
    const menuList = ["FOR YOU", "IN NEW", "POPULAR"];
    let products = [];
    navCard.render(menuList);

    // the initial products data by group name
    navCard.productListing(prodData["product-list"], iconData);

    // the menu navigation controller script
    const navMenuList = document.querySelectorAll(".navigation-menu .menu");
    let activeMenu = document.querySelector(".navigation-menu .menu.active");
    navMenuList.forEach(menu => {
        menu.addEventListener('click', (event) => {
            event.stopPropagation();
            products = [];
            if (activeMenu != menu) {
                activeMenu.classList.remove('active');
                menu.classList.toggle('active');
                activeMenu = menu;

                const menuTitle = menu.querySelector("p").textContent;

                // filter menu navigation
                prodData["product-list"].forEach(product => {
                    console.log(product);
                    if (menuTitle.toLowerCase() == "popular" && parseFloat(product.orders) > 50) { products.push(product); console.log(product); }
                    else if (menuTitle.toLowerCase() == "in new" && product.isNew == "yes") products.push(product);
                })

                if (products.length == 0) products.push(...prodData["product-list"]);

                // creating new product listing
                document.querySelector('.navigation-displayer .product-container').innerHTML = "";
                navCard.productListing(products, iconData);

                console.log("text content: ", products);
            }
        })
        console.log(menu);
    })
}

// main function runner 
async function main() {
    // initializing the category card
    const categoryData = await fetchData(url, 'categories.json');
    const addData = await fetchData(url, 'addCards.json');
    const productData = await fetchData(url, 'products.json');
    const iconData = await fetchData(url, 'icons.json');

    // this function is for displaying popular category
    categoryDisplayer(categoryData);

    // this function is for group displayer for specific main menu
    const groupAdd = addData['addCard-data'][0];
    const group = "Phones & Tablets";
    addData['addCard-data'].forEach(data => { if (data.parent == group) groupAdd = data; })
    groupDisplayer(group, categoryData, groupAdd, productData, iconData);

    // the menu product displayer
    navigationDisplayer(productData, iconData);
}

main();
