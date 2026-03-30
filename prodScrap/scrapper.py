import cloudscraper
from bs4 import BeautifulSoup
import json
import time
import random
import re

scraper = cloudscraper.create_scraper()

# 🔥 Rotating User Agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/118 Safari/537.36"
]

def get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
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


# 🔥 Improved request with retry
def get_page(url, retries=3):
    for attempt in range(retries):
        try:
            response = scraper.get(url, headers=get_headers(), timeout=20)

            if "captcha" in response.text.lower() or "sorry" in response.text.lower():
                print("⚠️ Blocked, retrying...")
                time.sleep(random.uniform(10, 20))
                continue

            return response.text

        except Exception as e:
            print("Request error:", e)
            time.sleep(5)

    return None


# 🔥 Extract brand from title (FAST)
def extract_brand_from_title(title):
    if not title:
        return None
    return title.split()[0]


# 🔥 Extract brand from product page (fallback)
def get_brand_from_page(product_url):
    html = get_page(product_url)
    if not html:
        return None

    soup = BeautifulSoup(html, "lxml")

    # 1. Byline
    byline = soup.select_one("#bylineInfo")
    if byline:
        match = re.search(r"(?i)(?:Visit the )?(.*?) Store", byline.text)
        if match:
            return match.group(1).strip()

    # 2. Tables (ALL layouts)
    rows = soup.select(
        "#productDetails_techSpec_section_1 tr,"
        "#productDetails_detailBullets_sections1 tr"
    )

    for row in rows:
        key = row.select_one("th")
        value = row.select_one("td")
        if key and value and "brand" in key.text.lower():
            return " ".join(value.text.split())

    # 3. Bullet fallback
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
        print(f"\n📦 Scraping {category} - Page {page}")

        html = get_page(url)
        if not html:
            continue

        soup = BeautifulSoup(html, "lxml")
        items = soup.select('[data-component-type="s-search-result"]')

        print(f"Found {len(items)} items")

        if len(items) == 0:
            print("❌ No items found (likely blocked)")
            continue

        for i, item in enumerate(items[:5]):  # 🔥 limit to avoid blocking
            try:
                name = item.select_one("h2 span")
                asin = item.get("data-asin")
                price_whole = item.select_one(".a-price-whole")
                price_fraction = item.select_one(".a-price-fraction")
                rating = item.select_one(".a-icon-alt")
                image = item.select_one("img")

                title = name.text.strip() if name else None
                product_url = f"https://www.amazon.com/dp/{asin}" if asin else None

                # 🔥 Smart brand logic
                brand = extract_brand_from_title(title)

                # Only fetch page for some products (reduce blocking)
                if not brand or i % 3 == 0:
                    page_brand = get_brand_from_page(product_url)
                    if page_brand:
                        brand = page_brand

                product = {
                    "category": category,
                    "name": title,
                    "brand": brand,
                    "price": (
                        price_whole.text.strip() + "." + price_fraction.text.strip()
                        if price_whole and price_fraction else None
                    ),
                    "rating": rating.text.strip() if rating else None,
                    "image": image["src"] if image else None,
                    "link": product_url
                }

                print("✔", title[:50], "| Brand:", brand)

                products.append(product)

                time.sleep(random.uniform(5, 10))  # 🔥 safer delay

            except Exception:
                continue

        time.sleep(random.uniform(10, 15))  # 🔥 delay per page

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