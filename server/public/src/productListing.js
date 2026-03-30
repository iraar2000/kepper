import { checkBox, productProperties, productDisplayer } from "./view.js"

async function fetchData(url, fileName) {
    try {
        const response = await fetch(url + fileName);
        const productData = await response.json();
        return productData
    } catch (error) {
        console.log(error);
    }
}

// the function which handles the product display checkboxes
function checkBoxHandler(checkBoxList) {
    checkBoxList.forEach(checkbox => {
        checkbox.addEventListener('click', (event) => {
            event.preventDefault();
            const checker = checkbox.querySelector('.check-image div');
            checker.classList.toggle('checked');
        })
    })
}

// the top category card forming
const url = "http://localhost:5555/public/data/";
const params = new URLSearchParams(window.location.search);
const filterSettings = {
    categories: [],
    properties: {}
};

async function categoryDisplayer(productData, categoryData, icons) {
    const categListing = document.querySelector('.category .categProp-listing .categProp-list');
    const title = document.querySelector('.categProp-topSubtitle');
    title.textContent = params.get('title').replace("-", " & ").toUpperCase();

    // all category appending
    const categItem = new checkBox("categProp-item");
    const item = categItem.renderTitle("All category");
    categListing.appendChild(item);
    item.querySelector('.check-image div').classList.toggle("checked")

    categoryData['category-list'].forEach(category => {
        if (category.parent.replace(" & ", "-").toLowerCase() == params.get('title')) {
            const categItem = new checkBox("categProp-item");
            categListing.appendChild(categItem.renderTitle(category.name));
        }
    });

    // handling the check box selection
    const checkboxBoxes = document.querySelectorAll(".categProp-item");

    // handler function
    checkBoxHandler(checkboxBoxes);
    categSelectionHandler(checkboxBoxes, productData, icons);
}

// this function is used to set the properties filter of products
function propertyDisplayer(productData, icons) {
    const prodProperty = new productProperties(params.get('title'));
    const propertyListing = document.querySelector('.properties .property-listing');

    // price displayer properties
    propertyListing.appendChild(prodProperty.byPrice(0.00, 1000.00));

    // rating displayer properties
    propertyListing.appendChild(prodProperty.byRating());

    // get the rating checkboxes
    const ratingBoxes = document.querySelectorAll('.rateContent-item');
    checkBoxHandler(ratingBoxes);

    // handling events in the property listing in product displayer
    propertySettingHandler(propertyListing, productData, icons);
}

// this function appends the checked categories to the selected container
async function categSelectionHandler(checkboxBoxes, productData, icons) {
    // the selected category
    document.addEventListener('click', (event) => {
        event.stopPropagation();

        const category_list = event.target.closest('.category .category-listing .categProp-list')
        if (category_list == null) return;

        const selectCategoryListing = document.querySelector('.category .categProp-listing .selected-listing');
        selectCategoryListing.innerHTML = "";

        checkboxBoxes.forEach(checkbox => {
            const checker = checkbox.querySelector('.check-image div');
            const checkTitle = checkbox.querySelector('.check-title');

            if (checker.classList.contains("checked")) {
                const selCategItem = document.createElement('div');
                selCategItem.textContent = checkTitle.textContent;
                selCategItem.setAttribute("class", 'select-categItem');
                selectCategoryListing.appendChild(selCategItem);
            }
        })

        const selectedCategories = document.querySelectorAll('.category .categProp-listing .selected-listing .select-categItem');
        filterSettings.categories.length = 0;
        filterSettings.categories.push(...Array.from(selectedCategories).map(item => item.textContent));

        const displayer = new productDisplayer(filterSettings, productData["product-list"]);
        displayer.productDisplay(icons);
    })

}

// this function handles the element property selection 
async function propertySettingHandler(propListing, productData, icons) {
    document.addEventListener('click', (event) => {
        event.preventDefault();

        // price range section
        const closeProperty = event.target.closest('.property');
        if (!closeProperty) return;

        const title = closeProperty.querySelector('.property-title').textContent.split(" ")[1];
        const content = closeProperty.querySelector('.property-content');
        const settingList = document.querySelector(".properties .properties-setting .setting-list");

        if (title == "price") {

            // price hanlding section
            const goBtn = event.target.closest('.setter');
            if (!goBtn) return;

            let settingContainer = settingList.querySelector('.price-setting');
            if (!settingContainer) {
                settingContainer = document.createElement("div");
                settingContainer.setAttribute("class", 'price-setting setting-container');
            }

            const minPrice = content.querySelector(".price .minPrice");
            const maxPrice = content.querySelector(".price .maxPrice");

            filterSettings.properties["price"] = {
                min: minPrice.value,
                max: maxPrice.value
            };

            const minPriceSet = "<div class='prop-setting'> Min: RWF " + minPrice.value + "</div>"
            const maxPriceSet = "<div class='prop-setting'> Max: RWF " + maxPrice.value + "</div>"
            settingContainer.innerHTML = minPriceSet + maxPriceSet;
            settingList.appendChild(settingContainer);
        } else if (title == "rating") {
            // rating handling
            const ratings = content.querySelectorAll(".rateContent-item");
            filterSettings.properties["rating"] = [];

            // see if the rate setting container already exists
            let settingContainer = settingList.querySelector('.rate-setting');
            if (!settingContainer) {
                settingContainer = document.createElement("div");
                settingContainer.setAttribute("class", 'rate-setting setting-container');
            }

            // the setting click event listener
            settingContainer.innerHTML = "";
            ratings.forEach(rate => {
                const checkedRate = rate.querySelector('.checkbox .check-image div');
                const checkedContent = rate.querySelector(".checkbox .check-content");

                const setting = document.createElement('div');
                setting.setAttribute("class", "prop-setting");

                if (checkedRate.classList.contains("checked")) {
                    setting.innerHTML = "Rate: " + checkedContent.dataset.rate + "/5";
                    filterSettings.properties["rating"].push(checkedContent.dataset.rate);
                    settingContainer.appendChild(setting);
                }
            });

            settingList.appendChild(settingContainer);
        }

        // filtering function call after setting the properties
        const displayer = new productDisplayer(filterSettings, productData["product-list"]);
        displayer.productDisplay(icons);
    })
}

async function main() {
    const productData = await fetchData(url, "products.json");
    const categoryData = await fetchData(url, "categories.json");
    const iconData = await fetchData(url, "icons.json");
    categoryDisplayer(productData, categoryData, iconData);
    propertyDisplayer(productData, iconData);

    const categProp = document.querySelector(".main-container .categProp-wrapper .categProp-container");
    const main = document.querySelector(".main-container");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", (event) => {
        const categPropRect = categProp.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 2. Stop at container bottom
        if (categPropRect.height < (viewportHeight - 40)) {
            categProp.classList.remove("stick-bottom");
            categProp.classList.add("stick-top");
        }
        else if (categPropRect.bottom <= viewportHeight) {
            categProp.classList.remove("stick-top");
            categProp.classList.add("stick-bottom");
        }

        // 3. Normal state (top of page)
        if (mainRect.top >= categPropRect.top && window.scrollY < lastScrollY) {
            categProp.classList.remove("stick-bottom");
        }

        lastScrollY = window.scrollY;
    });
}

main();