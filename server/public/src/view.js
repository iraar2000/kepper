// display product class
export class productDisplay {
    constructor(title, menu, products, isViewAll) {
        this.title = title;
        this.menu = menu;
        this.products = products;
        this.isViewAll = isViewAll;
    }

    render() {
        const displayTemplate = document.querySelector('.display-template').content.cloneNode(true);
        const displayHeader = displayTemplate.querySelector('.display-header');
        const headerContainer = displayHeader.querySelector('.header-container');
        const title = "<p class='title'>" + this.title + "</p>"
        if (this.title) headerContainer.innerHTML = title;
        return displayTemplate;
    }
}

// categogry card class
export class categoryCard {
    constructor(name, items, image) {
        this.name = name;
        this.items = items;
        this.image = image;
    }

    imageCreator() {
        const image = document.createElement('img');
        if (this.image) image.src = this.image;
        else image.src = '../images/default.png';
        image.classList.toggle('category-image')
        return image;
    }

    descriptionContent() {
        const title = document.createElement('p');
        const itemsDescription = document.createElement('p');

        // toggle export class name to the create elements
        title.classList.toggle('category-title');
        itemsDescription.classList.toggle('category-items');

        // assigning data and text content
        title.textContent = this.name;
        itemsDescription.textContent = this.items + ' items';

        return { title, itemsDescription }
    }

    render() {
        const categoryTemplate = document.querySelector('.categoryCard-template').content.cloneNode(true);
        const cardDescription = categoryTemplate.querySelector('.card-description');
        const cardImage = categoryTemplate.querySelector('.card-image');

        // the image appending on the container
        cardImage.appendChild(this.imageCreator());

        // the decription appending in the container
        const { title, itemsDescription } = this.descriptionContent();
        cardDescription.append(title, itemsDescription);
        return categoryTemplate;
    }
}

// group card class
export class groupCard {
    constructor(title) {
        this.title = title;
    }

    addCardFormation(add_title, add_subTitle, add_imageURL) {
        const addCardImage = document.createElement('div');
        const addImage = "<img src='" + add_imageURL + "' class='image' alt='add image'>"
        addCardImage.innerHTML = addImage;

        const addCardInfo = document.createElement('div');
        const infoTitle = "<p class='info-title'>" + add_title + "</p>";
        const subInfoTitle = "<p class='info-subTitle'>" + add_subTitle + ".</p>";
        const shopButton = "<div class='btn btn-md shop-button'>shop now</div>";

        // creating the export class name
        addCardInfo.classList.toggle('add-info');
        addCardImage.classList.toggle('add-image');

        // appending to the parent container
        addCardInfo.innerHTML = infoTitle + '\n' + subInfoTitle + '\n' + shopButton;

        return { addCardImage, addCardInfo };
    }

    groupCategoryFormation(categoryData) {
        const categoryContainer = document.createElement('div');

        // looping and creating category element
        let categLimit = 9;
        categoryData.forEach(category => {
            if (categLimit == 0) return;
            const categories = new categoryCard(category.name, category.items, category.image);
            categoryContainer.appendChild(categories.render());
            categLimit -= 1;
        })
        categoryContainer.classList.toggle('group-category');
        return categoryContainer;
    }

    productListing(products, icons) {
        const prodListContainer = document.createElement('div');
        prodListContainer.classList.toggle('product-container');
        products.forEach(product => {
            // the product card
            const prodCard = new productCard(
                product.id,
                product.name,
                product.image,
                '/product/' + product.name,
                product.currentPrice,
                product.previousPrice,
                product.toSave,
                product.isNew,
                product.instock,
                product.shipping,
                product.isGift
            );

            // rendering a product
            const prodRender = prodCard.render(icons);

            prodListContainer.appendChild(prodRender);
        })
        return prodListContainer;
    }

    render(addCardImage, addCardInfo, categoryContainer, prodListing) {
        const groupTemplate = document.querySelector('.group-template').content.cloneNode(true);
        const groupHeader = groupTemplate.querySelector('.group-container .group-header');
        const groupProducts = groupTemplate.querySelector('.group-container .group-products');

        // setting the group title and viewbtn
        groupHeader.querySelector('.group-title .title').textContent = this.title;
        groupHeader.querySelector('.group-title .viewbtn').href = "../src/productListing.html?title=" + this.title.toLowerCase().replace(" & ", "-");

        // setting the add and categories of the selected group
        const addCard = groupHeader.querySelector('.group-header-content .add-card');
        const categorySection = groupHeader.querySelector('.group-header-content .category-section');

        // add card creation area
        addCard.append(addCardImage, addCardInfo);

        // category section creation 
        categorySection.appendChild(categoryContainer);

        // product listing container
        groupProducts.appendChild(prodListing)

        return groupTemplate;
    }
}

// info card class
export class infoCard {
    constructor() {
        this.container = document.createElement('div');
    }
    withIconCard(text, icon) {
        const infoName = document.createElement('p');
        const infoIcon = document.createElement('object');

        infoName.textContent = text;
        infoIcon.type = 'image/svg+xml';
        infoIcon.data = icon;
        this.container.append(infoIcon, infoName);

        this.container.classList.toggle("info-card");
        infoName.classList.toggle('info-name');

        return this.container;
    }
    withoutIconCard(text) {
        this.container.textContent = text;
        this.container.classList.toggle("info-card");
        return this.container;
    }
}

// product card class
export class productCard {
    constructor(id, name, image, prodUrl, currPrice, prevPrice, toSave, isNew, inStock, shipping, isGift) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.prodUrl = prodUrl;
        this.currPrice = currPrice;
        this.prevPrice = prevPrice;
        this.toSave = toSave;
        this.isNew = isNew;
        this.inStock = inStock;
        this.shipping = shipping;
        this.isGift = isGift;
    }

    productInfo(icons) {
        const infoContainer = document.createElement('div');
        const shippingGift = document.createElement('div');
        const inStockContact = document.createElement('div');

        // shipping info section
        if (this.shipping == 0) {
            const infCard = new infoCard();
            const shippingCard = infCard.withoutIconCard("FREE SHIPPING")
            shippingCard.classList.toggle("info-greenCard");
            shippingGift.appendChild(shippingCard);
        }
        else if (this.shipping != 0) {
            const infCard = new infoCard();
            const shippingCard = infCard.withoutIconCard("RWF" + this.shipping + " DELIVERY")
            shippingCard.classList.toggle("info-grayCard");
            shippingGift.appendChild(shippingCard);
        }

        // gift info section
        if (this.isGift == 'yes') {
            const infCard = new infoCard();
            const giftCard = infCard.withoutIconCard("FREE GIFT")
            giftCard.classList.toggle("info-redCard");
            shippingGift.appendChild(giftCard);
        }

        // contact and instock info section
        if (this.inStock == 'no') {
            const infCard = new infoCard();
            const contactCard = infCard.withIconCard("CONTACT", icons.contact)
            inStockContact.appendChild(contactCard);
        }
        else {
            const infCard = new infoCard();
            const inStock = infCard.withIconCard("INSTOCK", icons.instock)
            inStockContact.appendChild(inStock);
        };

        infoContainer.append(shippingGift, inStockContact);

        // assigning the export class names
        infoContainer.classList.toggle('info-container');
        shippingGift.classList.toggle('shipping-gift-container');
        inStockContact.classList.toggle('instock-contact-container');

        return infoContainer;
    }

    productState(icons) {
        // adding the favorite icon to the product image
        const stateContainer = document.createElement('div');
        const favorite = document.createElement('div');
        if (favorite) favorite.innerHTML = "<object type='image/svg+xml' data=" + icons.favorite + "></object>"

        // adding the product state to the product image
        const state = document.createElement('div');
        if (this.toSave > 0) {
            state.innerHTML = "<p class='state-title'>SAVE</p><p class='state-content'>RWF" + this.toSave + "</p>";
            state.classList.toggle('save-state');
        }
        else if (this.isNew == "yes" || this.inStock == "no") {
            if (this.isNew == "yes") state.innerHTML = "<p class='state-content'>NEW</p>";
            else if (this.inStock == "no") state.innerHTML = "<p class='state-content'>OUT OF STOCK</p>";
            state.classList.toggle('announce-state');
        }

        // export class list assigning
        favorite.classList.toggle('favorite')
        state.classList.toggle('state');
        stateContainer.classList.toggle('state-container');

        // the creating state container and appending state elements
        stateContainer.append(state, favorite);

        return stateContainer;
    }

    productPrice(current, previous) {
        const priceCont = document.createElement('div');
        const currPrice = document.createElement('p');
        const prevPrice = document.createElement('p');

        // appending the children to parent and assigning data
        currPrice.textContent = "RWF" + current;
        prevPrice.textContent = "RWF" + previous;
        priceCont.appendChild(currPrice);
        if (previous && previous != 0) priceCont.appendChild(prevPrice);

        // assigning export class lists
        priceCont.classList.toggle("product-price");
        currPrice.classList.toggle('currPrice');
        if (current > previous) currPrice.classList.toggle('priceIncrease');
        else if (current < previous) currPrice.classList.toggle('priceDecrease');
        prevPrice.classList.toggle('prevPrice');
        return priceCont;
    }

    productImage() {
        const prodImageContainer = document.createElement('div');
        const stateContainer = document.createElement('div');
        const state = document.createElement('div');
        const favorite = document.createElement('div');
        const image = document.createElement('img');
        const link = document.createElement('a');

        // assigning data
        link.href = this.prodUrl;
        image.src = this.image;

        // append the child to parents
        link.appendChild(image);
        stateContainer.append(state, favorite);
        prodImageContainer.append(link, stateContainer);

        // product assign the export class name to the container
        prodImageContainer.classList.toggle('product-image');
        stateContainer.classList.toggle('state-container');
        link.classList.toggle('product-image-link');
        image.classList.toggle('image');
        state.classList.toggle('state');
        favorite.classList.toggle('favorite');

        return prodImageContainer;
    }

    productDescription(name, description) {
        const descripCont = document.createElement('div');
        const link = document.createElement('a');
        const nameTag = document.createElement('p');
        const descripTag = document.createElement('p');

        link.href = this.prodUrl;
        if (name) nameTag.textContent = name;
        if (description) descripTag.textContent = description;


        link.append(nameTag, descripTag);
        descripCont.appendChild(link);

        descripCont.classList.toggle('product-description');
        nameTag.classList.toggle('name');
        descripTag.classList.toggle('description');
        link.classList.toggle('product-link');
        return descripCont;
    }

    render(icons) {
        const prodCont = document.createElement('div');
        const prodImage = this.productImage();
        const prodDescr = this.productDescription(this.name);
        const prodPrice = this.productPrice(this.currPrice, this.prevPrice);
        const stateCont = this.productState(icons);
        const prodInfo = this.productInfo(icons);

        // adding the favorite icon to the product image and current product state
        prodImage.appendChild(stateCont);

        // appending the children to product container
        prodCont.appendChild(prodImage);
        prodCont.appendChild(prodDescr);
        prodCont.appendChild(prodPrice);
        prodCont.appendChild(prodInfo);

        // export class name assigning
        prodCont.classList.toggle('product');
        prodCont.dataset.prodId = this.id;
        return prodCont;
    }
}

// navigation card class
export class navigationCard {
    constructor() { }

    navigationMenu(template, menuList) {
        const navMenuContainer = template.querySelector('.navigation-menu .navigation-container');
        navMenuContainer.dataset.activemenu = menuList[0];
        menuList.forEach(menu => {
            const menuNav = document.createElement('div');
            const underLine = document.createElement('div');
            const navigator = document.createElement('p');

            if (navMenuContainer.dataset.activemenu == menu) menuNav.classList.toggle('active');
            menuNav.classList.toggle("menu");
            underLine.classList.toggle('underliner');

            menuNav.dataset.menuName = menu;
            navigator.textContent = menu;

            menuNav.appendChild(navigator);
            menuNav.appendChild(underLine);
            navMenuContainer.appendChild(menuNav);
        })
    }

    productListing(products, icons) {
        const prodListContainer = document.querySelector('.navigation-displayer .product-container');
        products.forEach(product => {
            // the product card
            const prodCard = new productCard(
                product.id,
                product.name,
                product.image,
                '/product/' + product.name,
                product.currentPrice,
                product.previousPrice,
                product.toSave,
                product.isNew,
                product.instock,
                product.shipping,
                product.isGift
            );

            // rendering a product
            const prodRender = prodCard.render(icons);

            prodListContainer.appendChild(prodRender);
        })
        return prodListContainer;
    }

    render(menuList) {
        const template = document.querySelector('.navDisplay-template').content.cloneNode(true);
        const contentContainer = document.querySelector('.content-container');
        this.navigationMenu(template, menuList);
        contentContainer.appendChild(template);
    }
}

export class checkBox {
    constructor(itemName) {
        this.itemName = itemName;
    }

    renderContent(content) {
        const checkbox = document.createElement('div');
        const checkImage = document.createElement('div');
        const checkContent = document.createElement('div');
        checkContent.appendChild(content);

        checkContent.classList.toggle('check-content');
        checkImage.classList.toggle('check-image');
        checkbox.classList.toggle('checkbox')
        checkbox.classList.toggle(this.itemName);

        checkImage.innerHTML = "<div></div>"
        checkbox.append(checkImage, checkContent);
        return checkbox;

    }

    renderTitle(name) {
        const checkbox = document.createElement('div');
        const checkImage = document.createElement('div');
        const checkTitle = document.createElement('p');
        checkTitle.textContent = name;

        checkTitle.classList.toggle('check-title');
        checkImage.classList.toggle('check-image');
        checkbox.classList.toggle('checkbox')
        checkbox.classList.toggle(this.itemName);

        checkImage.innerHTML = "<div></div>"
        checkbox.append(checkImage, checkTitle);

        return checkbox;
    }
}

// product listing screen filter displayer class
export class productProperties {
    constructor(mainCategory) {
        this.mainCategory = mainCategory;
    }

    byPrice(min, max) {
        const propertyContainer = document.createElement('div');
        const title = document.createElement('p');
        const priceContainer = document.createElement('div');
        const minPrice = document.createElement('div');
        const maxPrice = document.createElement('div');
        const separator = document.createElement('div');
        const setterButton = document.createElement('div');

        minPrice.innerHTML = "<p class='currency'>RWF</p><input value=" + min + " class='minPrice'/>"
        maxPrice.innerHTML = "<p class='currency'>RWF</p><input value=" + max + " class='maxPrice'/>"
        setterButton.textContent = "Go";
        title.textContent = "By price";

        priceContainer.append(minPrice, separator, maxPrice, setterButton);
        propertyContainer.append(title, priceContainer);

        propertyContainer.setAttribute("class", "property categProp-listing");
        priceContainer.setAttribute("class", "price-container property-content");
        title.setAttribute("class", "categProp-SubTitle property-title");
        minPrice.setAttribute("class", "price");
        maxPrice.setAttribute("class", "price");
        separator.setAttribute("class", "separator");
        setterButton.setAttribute("class", "setter");

        return propertyContainer;
    }

    byBrand(brandList) {
        const propertyContainer = document.createElement('div');
        const title = document.createElement('p');
        const brandContainer = document.createElement('div');

        title.textContent = "By brand";
        propertyContainer.append(title, brandContainer);


        propertyContainer.setAttribute("class", "property categProp-listing");
        title.setAttribute("class", "categProp-SubTitle property-title");
        brandContainer.setAttribute("class", "brand-container property-content");

        return propertyContainer;
    }

    byRating() {
        const propertyContainer = document.createElement('div');
        const title = document.createElement('p');
        const rateContainer = document.createElement('div');

        title.textContent = "By rating";

        for (let index = 0; index < 5; index++) {
            const content = document.createElement('div');
            let contentHtml = "";
            for (let i = index; i < 5; i++) {
                contentHtml += `
                    <div class='rate-star'>
                        <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.92453 10.4479L11.2039 13L10.0683 8.19L13.8491 4.95368L8.87032 4.52947L6.92453 0L4.97874 4.52947L0 4.95368L3.77387 8.19L2.64517 13L6.92453 10.4479Z" fill="#FFBF00"/>
                        </svg>
                    </div>
                `;
            }
            content.innerHTML = contentHtml;
            content.classList.toggle('rate-content');

            const rateCheckBox = new checkBox('rateContent-item');
            const rateContent = rateCheckBox.renderContent(content);
            const checkContent = rateContent.querySelector('.check-content')

            const quantity = document.createElement('div');
            quantity.classList.toggle('quantity');
            quantity.textContent = "(" + 0 + ")";

            checkContent.dataset.rate = 5 - index;

            checkContent.appendChild(quantity);
            rateContainer.appendChild(rateContent);
        }

        propertyContainer.append(title, rateContainer);

        propertyContainer.setAttribute("class", "property categProp-listing");
        title.setAttribute("class", "categProp-SubTitle property-title");
        rateContainer.setAttribute("class", "rate-container property-content");

        return propertyContainer;
    }

    byColor() {
        const propertyContainer = document.createElement('div');
        const title = document.createElement('p');
        const colorContainer = document.createElement('div');

        title.textContent = "By Color";
        propertyContainer.append(title, colorContainer);

        propertyContainer.setAttribute("class", "property categProp-listing");
        title.setAttribute("class", "categProp-SubTitle property-title");
        colorContainer.setAttribute("class", "color-container property-content");

        return propertyContainer
    }

}

// product listing displayer class
export class productDisplayer {
    constructor(filterSettings, productData) {
        this.filterSettings = filterSettings;
        this.productData = productData;
    }

    // category matching function
    isCategoryMatched(product) {
        for (const category of this.filterSettings.categories) {
            if (category.toLowerCase() == product.category.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    // properties matching function
    isPropertyMatched(product) {
        // price filtering
        if (this.filterSettings.properties["price"]) {
            const { min, max } = this.filterSettings.properties["price"];
            if (product.currentPrice < min || product.currentPrice > max) {
                return false;
            }
        }

        // rating filtering
        if (this.filterSettings.properties["rating"]?.length > 0) {
            console.log(this.filterSettings.properties["rating"], Math.floor(product.rate));
            if (!this.filterSettings.properties["rating"].includes(Math.floor(product.rate).toString())) {
                return false;
            }
        }

        return true;
    }

    // this function handles product filtering by category and properties setting
    productFilteringHandler() {
        // filtering by category
        const filteredByCategory = this.productData.filter(product => {
            return this.isCategoryMatched(product);
        });

        // filter by properties
        const filteredByProperties = filteredByCategory.filter(product => {
            return this.isPropertyMatched(product);
        });

        // Display the filtered products
        return filteredByProperties;
    }

    productListing(products, icons) {
        const productListingContainer = document.createElement('div');
        products.forEach(product => {
            // the product card
            const prodCard = new productCard(
                product.id,
                product.name,
                product.image,
                '/product/' + product.name,
                product.currentPrice,
                product.previousPrice,
                product.toSave,
                product.isNew,
                product.instock,
                product.shipping,
                product.isGift
            );

            // rendering a product
            const prodRender = prodCard.render(icons);

            productListingContainer.appendChild(prodRender);
        })
        productListingContainer.setAttribute("class", "productDisplay-container");
        return productListingContainer;
    }

    productDisplay(icons) {
        const prodDisplay = document.querySelector('.main-container .product-container');
        prodDisplay.innerHTML = "";
        const productList = this.productFilteringHandler(this.filterSettings, this.productData);

        const listing = this.productListing(productList, icons);
        prodDisplay.appendChild(listing);
    };
}