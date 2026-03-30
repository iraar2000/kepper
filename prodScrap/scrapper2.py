import cloudscraper
from bs4 import BeautifulSoup
import json
import time
import random

scraper = cloudscraper.create_scraper()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "en-US,en;q=0.9",
}

CATEGORIES = {
    "phones": "https://www.amazon.com/s?k=smartphones",
    "cameras": "https://www.amazon.com/s?k=camera",
    "tablets": "https://www.amazon.com/s?k=tablet",
    "shoes": "https://www.amazon.com/s?k=shoes",
    "clothes": "https://www.amazon.com/s?k=clothes",
    "watches": "https://www.amazon.com/s?k=watches",
    "rentals": "https://www.amazon.com/s?k=rentals"
}


def get_page(url):
    try:
        response = scraper.get(url, headers=HEADERS, timeout=20)

        if "captcha" in response.text.lower():
            print("⚠️ CAPTCHA detected!",  response.text.lower())
            return None

        return response.text

    except Exception as e:
        print("Request error:", e)
        return None


# 🔥 NEW: extract brand from product page
def get_brand(product_url):
    html = get_page(product_url)
    if not html:
        return None

    soup = BeautifulSoup(html, "lxml")

    # 1. Try byline (BEST)
    byline = soup.select_one("#bylineInfo")
    if byline:
        return byline.text.replace("Visit the", "").replace("Store", "").strip()

    # 2. Try product details tables
    rows = soup.select("#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr")
    for row in rows:
        key = row.select_one("th")
        value = row.select_one("td")
        if key and value and "brand" in key.text.lower():
            return value.text.strip()

    # 3. Try bullet section
    bullets = soup.select("#detailBullets_feature_div li")
    for li in bullets:
        text = li.text.strip()
        if "brand" in text.lower():
            return text.split(":")[-1].strip()

    return None


def scrape_category(category, base_url, pages=2):
    products = []

    for page in range(1, pages + 1):
        url = f"{base_url}&page={page}"
        print(f"Scraping {category} - Page {page}")

        html = get_page(url)
        if not html:
            continue

        soup = BeautifulSoup(html, "lxml")
        items = soup.select('[data-component-type="s-search-result"]')

        print(f"Found {len(items)} items")

        if len(items) == 0:
            print("❌ No items found (likely blocked)")
            continue

        for item in items[:8]:  # 🔥 limit to avoid blocking
            try:
                name = item.select_one("h2 span")
                asin = item.get("data-asin")
                price_whole = item.select_one(".a-price-whole")
                price_fraction = item.select_one(".a-price-fraction")
                rating = item.select_one(".a-icon-alt")
                image = item.select_one("img")

                product_url = f"https://www.amazon.com/dp/{asin}" if asin else None

                # 🔥 NEW: get brand
                brand = get_brand(product_url) if product_url else None

                product = {
                    "category": category,
                    "name": name.text.strip() if name else None,
                    "brand": brand,  # ✅ added
                    "price": (
                        price_whole.text.strip() + "." + price_fraction.text.strip()
                        if price_whole and price_fraction else None
                    ),
                    "rating": rating.text.strip() if rating else None,
                    "image": image["src"] if image else None,
                    "link": product_url
                }

                print("✔", product["name"][:50], "| Brand:", brand)

                products.append(product)

                time.sleep(random.uniform(2, 4))  # delay per product

            except Exception:
                continue

        time.sleep(random.uniform(3, 6))  # delay per page

    return products


def main():
    all_products = []

    for category, url in CATEGORIES.items():
        data = scrape_category(category, url, pages=2)
        all_products.extend(data)

    with open("amazon_products.json", "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print("\n✅ Saved to amazon_products.json")


if __name__ == "__main__":
    main()