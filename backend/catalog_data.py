"""
Nearza Catalog Data Specification
Provides realistic Indian local-retail products with authentic product photography.
"""

CATALOG = [
    # ---------------------------------------------------------
    # 1. GROCERY
    # ---------------------------------------------------------
    {
        "category": "grocery",
        "name": "Aashirvaad Shudh Chakki Atta",
        "brand": "Aashirvaad",
        "unit": "kg",
        "unit_value": 5.0,
        "description": "100% pure whole wheat flour processed with traditional stone-chakki grinding for soft, fluffy rotis.",
        "image_source": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 245.00, "quantity": 35, "stock_status": "in_stock", "sku": "GRO-ATT-001"},
            {"shop_slug": "ankola-super-bazar", "price": 240.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-ATT-5KG"},
        ]
    },
    {
        "category": "grocery",
        "name": "Fortune Sunlite Refined Sunflower Oil",
        "brand": "Fortune",
        "unit": "L",
        "unit_value": 1.0,
        "description": "Light, healthy refined sunflower oil enriched with Vitamins A & D, ideal for daily home cooking and frying.",
        "image_source": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 142.00, "quantity": 28, "stock_status": "in_stock", "sku": "GRO-OIL-002"},
            {"shop_slug": "ankola-super-bazar", "price": 139.00, "quantity": 40, "stock_status": "in_stock", "sku": "ASB-OIL-1L"},
        ]
    },
    {
        "category": "grocery",
        "name": "India Gate Basmati Rice",
        "brand": "India Gate",
        "unit": "kg",
        "unit_value": 5.0,
        "description": "Aged premium long-grain aromatic basmati rice, perfect for fragrant biryanis and daily steamed rice.",
        "image_source": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 490.00, "quantity": 18, "stock_status": "in_stock", "sku": "GRO-RIC-003"},
            {"shop_slug": "ankola-super-bazar", "price": 475.00, "quantity": 25, "stock_status": "in_stock", "sku": "ASB-RIC-5KG"},
        ]
    },
    {
        "category": "grocery",
        "name": "Tata Salt Vacuum Evaporated Iodised Salt",
        "brand": "Tata",
        "unit": "kg",
        "unit_value": 1.0,
        "description": "Desh Ka Namak. Pure vacuum evaporated iodised salt ensuring essential iodine intake for family wellness.",
        "image_source": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 28.00, "quantity": 60, "stock_status": "in_stock", "sku": "GRO-SLT-004"},
            {"shop_slug": "ankola-super-bazar", "price": 27.00, "quantity": 80, "stock_status": "in_stock", "sku": "ASB-SLT-1KG"},
        ]
    },
    {
        "category": "grocery",
        "name": "Tata Sampann Unpolished Toor Dal",
        "brand": "Tata Sampann",
        "unit": "kg",
        "unit_value": 1.0,
        "description": "Unpolished yellow pigeon peas rich in natural protein and dietary fiber, without artificial polishing or chemicals.",
        "image_source": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 165.00, "quantity": 22, "stock_status": "in_stock", "sku": "GRO-DAL-005"},
            {"shop_slug": "ankola-super-bazar", "price": 158.00, "quantity": 30, "stock_status": "in_stock", "sku": "ASB-DAL-1KG"},
        ]
    },

    # ---------------------------------------------------------
    # 2. FRUITS & VEGETABLES
    # ---------------------------------------------------------
    {
        "category": "fruits-vegetables",
        "name": "Fresh Royal Gala Apples",
        "brand": "Farm Fresh",
        "unit": "kg",
        "unit_value": 1.0,
        "description": "Crisp, sweet, and juicy Royal Gala apples sourced fresh from Himachal orchards. Rich in fiber and antioxidants.",
        "image_source": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 180.00, "quantity": 15, "stock_status": "in_stock", "sku": "FRT-APP-001"},
            {"shop_slug": "ankola-super-bazar", "price": 175.00, "quantity": 25, "stock_status": "in_stock", "sku": "ASB-APP-1KG"},
        ]
    },
    {
        "category": "fruits-vegetables",
        "name": "Fresh Robusta Bananas",
        "brand": "Farm Fresh",
        "unit": "kg",
        "unit_value": 1.0,
        "description": "Naturally ripened Robusta bananas from local Karnataka farms. Energy booster packed with potassium.",
        "image_source": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 50.00, "quantity": 30, "stock_status": "in_stock", "sku": "FRT-BAN-002"},
            {"shop_slug": "ankola-super-bazar", "price": 48.00, "quantity": 40, "stock_status": "in_stock", "sku": "ASB-BAN-1KG"},
        ]
    },
    {
        "category": "fruits-vegetables",
        "name": "Fresh Hybrid Red Tomatoes",
        "brand": "Farm Fresh",
        "unit": "kg",
        "unit_value": 1.0,
        "description": "Plump, firm, and tangy vine-ripened red tomatoes for flavorful curries, rasam, and fresh salads.",
        "image_source": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 38.00, "quantity": 25, "stock_status": "in_stock", "sku": "VEG-TOM-003"},
            {"shop_slug": "ankola-super-bazar", "price": 35.00, "quantity": 35, "stock_status": "in_stock", "sku": "ASB-TOM-1KG"},
        ]
    },
    {
        "category": "fruits-vegetables",
        "name": "Fresh Jyoti Potatoes",
        "brand": "Farm Fresh",
        "unit": "kg",
        "unit_value": 2.0,
        "description": "Golden-skinned cooking potatoes with fluffy interior, versatile for aloo parathas, curries, and fries.",
        "image_source": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 65.00, "quantity": 40, "stock_status": "in_stock", "sku": "VEG-POT-004"},
            {"shop_slug": "ankola-super-bazar", "price": 60.00, "quantity": 60, "stock_status": "in_stock", "sku": "ASB-POT-2KG"},
        ]
    },
    {
        "category": "fruits-vegetables",
        "name": "Fresh Nasik Red Onions",
        "brand": "Farm Fresh",
        "unit": "kg",
        "unit_value": 2.0,
        "description": "Crisp and pungent high-grade Nasik red onions, an essential aromatic foundation for daily Indian recipes.",
        "image_source": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 75.00, "quantity": 35, "stock_status": "in_stock", "sku": "VEG-ONI-005"},
            {"shop_slug": "ankola-super-bazar", "price": 70.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-ONI-2KG"},
        ]
    },

    # ---------------------------------------------------------
    # 3. DAIRY & EGGS
    # ---------------------------------------------------------
    {
        "category": "dairy-eggs",
        "name": "Amul Taaza Homogenised Toned Milk",
        "brand": "Amul",
        "unit": "L",
        "unit_value": 1.0,
        "description": "Pasteurized and homogenised toned milk with 3.0% fat, wholesome for daily tea, coffee, and cereal.",
        "image_source": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 54.00, "quantity": 40, "stock_status": "in_stock", "sku": "DAI-MLK-001"},
            {"shop_slug": "ankola-super-bazar", "price": 54.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-MLK-1L"},
        ]
    },
    {
        "category": "dairy-eggs",
        "name": "Farm Fresh Brown Eggs",
        "brand": "Farm Fresh",
        "unit": "pack",
        "unit_value": 6.0,
        "description": "Graded, farm-fresh antibiotic-free brown eggs rich in wholesome natural protein, choline, and lutein.",
        "image_source": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 60.00, "quantity": 25, "stock_status": "in_stock", "sku": "DAI-EGG-002"},
            {"shop_slug": "ankola-super-bazar", "price": 58.00, "quantity": 30, "stock_status": "in_stock", "sku": "ASB-EGG-6PK"},
        ]
    },
    {
        "category": "dairy-eggs",
        "name": "Amul Pasteurised Salted Butter",
        "brand": "Amul",
        "unit": "g",
        "unit_value": 500.0,
        "description": "Utterly Butterly Delicious creamy salted butter made from wholesome fresh cow and buffalo milk.",
        "image_source": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 275.00, "quantity": 16, "stock_status": "in_stock", "sku": "DAI-BUT-003"},
            {"shop_slug": "ankola-super-bazar", "price": 270.00, "quantity": 24, "stock_status": "in_stock", "sku": "ASB-BUT-500G"},
        ]
    },
    {
        "category": "dairy-eggs",
        "name": "Nandini Fresh Thick Curd",
        "brand": "Nandini",
        "unit": "g",
        "unit_value": 500.0,
        "description": "Pure Karnataka cooperative dairy curd, traditionally cultured for creamy texture and probiotic gut health.",
        "image_source": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 28.00, "quantity": 30, "stock_status": "in_stock", "sku": "DAI-CRD-004"},
            {"shop_slug": "ankola-super-bazar", "price": 28.00, "quantity": 35, "stock_status": "in_stock", "sku": "ASB-CRD-500G"},
        ]
    },
    {
        "category": "dairy-eggs",
        "name": "Milky Mist Fresh Malai Paneer",
        "brand": "Milky Mist",
        "unit": "g",
        "unit_value": 200.0,
        "description": "Soft, melt-in-mouth cottage cheese blocks prepared from standardized whole milk. Ideal for paneer tikka & curries.",
        "image_source": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 95.00, "quantity": 12, "stock_status": "in_stock", "sku": "DAI-PAN-005"},
            {"shop_slug": "ankola-super-bazar", "price": 92.00, "quantity": 20, "stock_status": "in_stock", "sku": "ASB-PAN-200G"},
        ]
    },

    # ---------------------------------------------------------
    # 4. BAKERY
    # ---------------------------------------------------------
    {
        "category": "bakery",
        "name": "Modern Classic White Sandwich Bread",
        "brand": "Modern",
        "unit": "g",
        "unit_value": 400.0,
        "description": "Soft and fluffy sliced white sandwich loaf, baked fresh daily with fortified vitamins and minerals.",
        "image_source": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 45.00, "quantity": 20, "stock_status": "in_stock", "sku": "BAK-BRD-001"},
            {"shop_slug": "ankola-super-bazar", "price": 42.00, "quantity": 30, "stock_status": "in_stock", "sku": "ASB-BRD-400G"},
        ]
    },
    {
        "category": "bakery",
        "name": "Fresh Dark Chocolate Truffle Cake",
        "brand": "Local Bakeries",
        "unit": "g",
        "unit_value": 500.0,
        "description": "Decadent layered dark chocolate sponge cake enveloped in rich, silky chocolate ganache truffle frosting.",
        "image_source": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 380.00, "quantity": 5, "stock_status": "in_stock", "sku": "ASB-CAK-500G"},
            {"shop_slug": "sri-ganesh-stores", "price": 395.00, "quantity": 2, "stock_status": "low_stock", "sku": "BAK-CAK-002"},
        ]
    },
    {
        "category": "bakery",
        "name": "Crispy Baked Vegetable Puff",
        "brand": "Local Bakeries",
        "unit": "piece",
        "unit_value": 2.0,
        "description": "Flaky golden-brown puff pastry parcels stuffed with spicy spiced potatoes, peas, and roasted cumin.",
        "image_source": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 40.00, "quantity": 18, "stock_status": "in_stock", "sku": "BAK-PUF-003"},
            {"shop_slug": "ankola-super-bazar", "price": 36.00, "quantity": 25, "stock_status": "in_stock", "sku": "ASB-PUF-2PC"},
        ]
    },
    {
        "category": "bakery",
        "name": "Britannia Little Hearts Biscuits",
        "brand": "Britannia",
        "unit": "g",
        "unit_value": 75.0,
        "description": "Iconic heart-shaped crispy sugar-glazed puff biscuits with a delightful melt-in-mouth bite.",
        "image_source": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 25.00, "quantity": 40, "stock_status": "in_stock", "sku": "BAK-HRT-004"},
            {"shop_slug": "ankola-super-bazar", "price": 24.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-HRT-75G"},
        ]
    },
    {
        "category": "bakery",
        "name": "Chocolate Glazed Ring Donut",
        "brand": "Local Bakeries",
        "unit": "piece",
        "unit_value": 2.0,
        "description": "Tender leavened ring donuts dipped in glossy Belgian milk chocolate glaze and topped with rainbow sprinkles.",
        "image_source": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 85.00, "quantity": 8, "stock_status": "in_stock", "sku": "ASB-DON-2PC"},
            {"shop_slug": "sri-ganesh-stores", "price": 90.00, "quantity": 0, "stock_status": "out_of_stock", "sku": "BAK-DON-005"},
        ]
    },

    # ---------------------------------------------------------
    # 5. ELECTRONICS
    # ---------------------------------------------------------
    {
        "category": "electronics",
        "name": "Boat Rockerz 255 Pro+ Wireless Earphones",
        "brand": "Boat",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Bluetooth v5.2 neckband with up to 40 hours total playback, ASAP Fast Charge, and IPX7 water resistance.",
        "image_source": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 1299.00, "quantity": 15, "stock_status": "in_stock", "sku": "CDH-EAR-001"},
            {"shop_slug": "ankola-super-bazar", "price": 1349.00, "quantity": 8, "stock_status": "in_stock", "sku": "ASB-EAR-BOAT"},
        ]
    },
    {
        "category": "electronics",
        "name": "JBL Go 3 Ultra-Portable Bluetooth Speaker",
        "brand": "JBL",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Compact waterproof outdoor speaker with punchy JBL Pro Sound, stylish fabric grill, and 5-hour playtime.",
        "image_source": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 2899.00, "quantity": 10, "stock_status": "in_stock", "sku": "CDH-SPK-002"},
            {"shop_slug": "ankola-super-bazar", "price": 2999.00, "quantity": 6, "stock_status": "in_stock", "sku": "ASB-SPK-JBL"},
        ]
    },
    {
        "category": "electronics",
        "name": "Noise ColorFit Pulse 2 Smartwatch",
        "brand": "Noise",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "1.85-inch vibrant TFT display, Bluetooth calling, 24/7 heart rate monitor, SpO2 sensor, and 100+ sports modes.",
        "image_source": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 1499.00, "quantity": 12, "stock_status": "in_stock", "sku": "CDH-WTC-003"},
            {"shop_slug": "ankola-super-bazar", "price": 1599.00, "quantity": 4, "stock_status": "low_stock", "sku": "ASB-WTC-NOI"},
        ]
    },
    {
        "category": "electronics",
        "name": "Mi 10000mAh Power Bank 3i",
        "brand": "Xiaomi",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Dual output USB ports with 18W fast charging support, metallic casing, and 12 layers of advanced circuit protection.",
        "image_source": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 1199.00, "quantity": 20, "stock_status": "in_stock", "sku": "CDH-PWR-004"},
            {"shop_slug": "ankola-super-bazar", "price": 1249.00, "quantity": 10, "stock_status": "in_stock", "sku": "ASB-PWR-MI"},
        ]
    },
    {
        "category": "electronics",
        "name": "Portronics 20W Mach Fast USB-C Charger",
        "brand": "Portronics",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Power Delivery (PD) fast wall adapter compatible with iPhone, Samsung, and Android devices. BIS certified safety.",
        "image_source": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 449.00, "quantity": 25, "stock_status": "in_stock", "sku": "CDH-CHG-005"},
            {"shop_slug": "sri-ganesh-stores", "price": 499.00, "quantity": 5, "stock_status": "in_stock", "sku": "SGS-CHG-20W"},
        ]
    },

    # ---------------------------------------------------------
    # 6. MOBiles & ACCESSORIES
    # ---------------------------------------------------------
    {
        "category": "mobiles",
        "name": "Redmi 13C 5G (Starlight Black, 128GB)",
        "brand": "Xiaomi",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "MediaTek Dimensity 6100+ 5G processor, 6.74-inch 90Hz display, 50MP AI dual camera, and 5000mAh battery.",
        "image_source": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 10499.00, "quantity": 8, "stock_status": "in_stock", "sku": "CDH-MOB-001"},
            {"shop_slug": "ankola-super-bazar", "price": 10799.00, "quantity": 4, "stock_status": "in_stock", "sku": "ASB-MOB-R13C"},
        ]
    },
    {
        "category": "mobiles",
        "name": "Samsung Galaxy M15 5G (Celestial Blue, 128GB)",
        "brand": "Samsung",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Super AMOLED 90Hz display, 50MP triple camera system, monster 6000mAh battery, and 4 generations of OS updates.",
        "image_source": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 12999.00, "quantity": 6, "stock_status": "in_stock", "sku": "CDH-MOB-002"},
            {"shop_slug": "ankola-super-bazar", "price": 13299.00, "quantity": 3, "stock_status": "low_stock", "sku": "ASB-MOB-M15"},
        ]
    },
    {
        "category": "mobiles",
        "name": "Spigen Rugged Armor Matte Shockproof Case",
        "brand": "Spigen",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Carbon fiber detailing with Air Cushion Technology for military-grade drop shock protection and tactile buttons.",
        "image_source": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 799.00, "quantity": 18, "stock_status": "in_stock", "sku": "CDH-ACC-003"},
            {"shop_slug": "sri-ganesh-stores", "price": 849.00, "quantity": 8, "stock_status": "in_stock", "sku": "SGS-ACC-CASE"},
        ]
    },
    {
        "category": "mobiles",
        "name": "Boat Deuce 300 Braided Type-C Fast Cable",
        "brand": "Boat",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Heavy-duty nylon braided 1.5-meter Type-C cable supporting 3A fast charging and 480Mbps ultra-fast data transfer.",
        "image_source": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 249.00, "quantity": 30, "stock_status": "in_stock", "sku": "CDH-ACC-004"},
            {"shop_slug": "sri-ganesh-stores", "price": 270.00, "quantity": 15, "stock_status": "in_stock", "sku": "SGS-ACC-CBL"},
        ]
    },
    {
        "category": "mobiles",
        "name": "9H Hardness Edge-to-Edge Tempered Glass",
        "brand": "ScreenGuard",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Crystal clear 9H tempered glass screen protector with oleophobic coating to prevent fingerprints and scratches.",
        "image_source": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "coastal-digital-hub", "price": 149.00, "quantity": 40, "stock_status": "in_stock", "sku": "CDH-ACC-005"},
            {"shop_slug": "sri-ganesh-stores", "price": 150.00, "quantity": 20, "stock_status": "in_stock", "sku": "SGS-ACC-GLS"},
        ]
    },

    # ---------------------------------------------------------
    # 7. FASHION
    # ---------------------------------------------------------
    {
        "category": "fashion",
        "name": "Men's Slim Fit Casual Oxford Cotton Shirt",
        "brand": "Dennis Lingo",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "100% breathable premium cotton woven shirt with button-down collar and curved hem for smart-casual wear.",
        "image_source": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 699.00, "quantity": 14, "stock_status": "in_stock", "sku": "ASB-FAS-001"},
            {"shop_slug": "sri-ganesh-stores", "price": 725.00, "quantity": 6, "stock_status": "in_stock", "sku": "SGS-FAS-SHT"},
        ]
    },
    {
        "category": "fashion",
        "name": "Women's Floral Embroidered Rayon Kurti",
        "brand": "Aurelia",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Elegant straight-cut ethnic kurti with delicate thread embroidery on neckline and 3/4 sleeves. Lightweight fabric.",
        "image_source": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 849.00, "quantity": 12, "stock_status": "in_stock", "sku": "ASB-FAS-002"},
            {"shop_slug": "sri-ganesh-stores", "price": 899.00, "quantity": 4, "stock_status": "low_stock", "sku": "SGS-FAS-KRT"},
        ]
    },
    {
        "category": "fashion",
        "name": "Men's Straight Fit Stretch Denim Jeans",
        "brand": "Spykar",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Durable cotton-elastane indigo stretch denim with classic five-pocket styling and sturdy rivets.",
        "image_source": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 1199.00, "quantity": 10, "stock_status": "in_stock", "sku": "ASB-FAS-003"},
            {"shop_slug": "sri-ganesh-stores", "price": 1249.00, "quantity": 3, "stock_status": "low_stock", "sku": "SGS-FAS-JNS"},
        ]
    },
    {
        "category": "fashion",
        "name": "Unisex Classic Solid Crewneck Cotton T-Shirt",
        "brand": "Allen Solly",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Bio-washed combed cotton everyday crewneck t-shirt with reinforced double-stitched collar and hems.",
        "image_source": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 399.00, "quantity": 25, "stock_status": "in_stock", "sku": "ASB-FAS-004"},
            {"shop_slug": "sri-ganesh-stores", "price": 420.00, "quantity": 12, "stock_status": "in_stock", "sku": "SGS-FAS-TEE"},
        ]
    },
    {
        "category": "fashion",
        "name": "Kids Pure Cotton Casual Printed Wear Set",
        "brand": "Gini & Jony",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "Ultra-soft hypoallergenic printed cotton tee and shorts set, gentle on young sensitive skin for all-day comfort.",
        "image_source": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "ankola-super-bazar", "price": 499.00, "quantity": 15, "stock_status": "in_stock", "sku": "ASB-FAS-005"},
            {"shop_slug": "sri-ganesh-stores", "price": 525.00, "quantity": 8, "stock_status": "in_stock", "sku": "SGS-FAS-KID"},
        ]
    },

    # ---------------------------------------------------------
    # 8. BEAUTY & PERSONAL CARE
    # ---------------------------------------------------------
    {
        "category": "beauty",
        "name": "Dove Daily Moisture Nourishing Shampoo",
        "brand": "Dove",
        "unit": "mL",
        "unit_value": 340.0,
        "description": "Pro-Moisture complex deeply nourishes dry strands from root to tip, leaving hair noticeably silky and resilient.",
        "image_source": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 285.00, "quantity": 20, "stock_status": "in_stock", "sku": "BEA-SHM-001"},
            {"shop_slug": "ankola-super-bazar", "price": 275.00, "quantity": 30, "stock_status": "in_stock", "sku": "ASB-SHM-340M"},
        ]
    },
    {
        "category": "beauty",
        "name": "Himalaya Purifying Neem Face Wash",
        "brand": "Himalaya",
        "unit": "mL",
        "unit_value": 150.0,
        "description": "Soap-free herbal formulation with antibacterial Neem and Turmeric to combat acne and excess surface oil.",
        "image_source": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 165.00, "quantity": 25, "stock_status": "in_stock", "sku": "BEA-FSH-002"},
            {"shop_slug": "ankola-super-bazar", "price": 160.00, "quantity": 35, "stock_status": "in_stock", "sku": "ASB-FSH-150M"},
        ]
    },
    {
        "category": "beauty",
        "name": "Nivea Nourishing Body Milk Deep Moisture Lotion",
        "brand": "Nivea",
        "unit": "mL",
        "unit_value": 400.0,
        "description": "Deep Moisture Serum enriched with 2x almond oil provides up to 48 hours of intense hydration for dry skin.",
        "image_source": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 360.00, "quantity": 14, "stock_status": "in_stock", "sku": "BEA-LOT-003"},
            {"shop_slug": "ankola-super-bazar", "price": 345.00, "quantity": 20, "stock_status": "in_stock", "sku": "ASB-LOT-400M"},
        ]
    },
    {
        "category": "beauty",
        "name": "Dettol Original Germ Protection Liquid Handwash",
        "brand": "Dettol",
        "unit": "mL",
        "unit_value": 200.0,
        "description": "Trusted pine fragrance antibacterial liquid soap formula proven to kill 99.9% of germs and illness-causing bacteria.",
        "image_source": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 99.00, "quantity": 30, "stock_status": "in_stock", "sku": "BEA-HND-004"},
            {"shop_slug": "ankola-super-bazar", "price": 95.00, "quantity": 45, "stock_status": "in_stock", "sku": "ASB-HND-200M"},
        ]
    },
    {
        "category": "beauty",
        "name": "Pears Pure & Gentle Glycerin Bathing Bar",
        "brand": "Pears",
        "unit": "g",
        "unit_value": 125.0,
        "description": "Transparent pure glycerin cleansing soap with natural oils, formulated to preserve skin's moisture balance.",
        "image_source": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 68.00, "quantity": 40, "stock_status": "in_stock", "sku": "BEA-SOP-005"},
            {"shop_slug": "ankola-super-bazar", "price": 65.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-SOP-125G"},
        ]
    },

    # ---------------------------------------------------------
    # 9. HOUSEHOLD ESSENTIALS
    # ---------------------------------------------------------
    {
        "category": "household",
        "name": "Vim Lemon Dishwash Gel",
        "brand": "Vim",
        "unit": "mL",
        "unit_value": 500.0,
        "description": "Concentrated degreasing liquid dish gel with real lemon juice power. Easily cuts through tough burnt grease.",
        "image_source": "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 120.00, "quantity": 25, "stock_status": "in_stock", "sku": "HOU-DSH-001"},
            {"shop_slug": "ankola-super-bazar", "price": 115.00, "quantity": 40, "stock_status": "in_stock", "sku": "ASB-DSH-500M"},
        ]
    },
    {
        "category": "household",
        "name": "Surf Excel Matic Top Load Liquid Detergent",
        "brand": "Surf Excel",
        "unit": "L",
        "unit_value": 1.0,
        "description": "Specially designed liquid detergent for top load washing machines that removes tough stains inside the machine.",
        "image_source": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 235.00, "quantity": 18, "stock_status": "in_stock", "sku": "HOU-DET-002"},
            {"shop_slug": "ankola-super-bazar", "price": 225.00, "quantity": 30, "stock_status": "in_stock", "sku": "ASB-DET-1L"},
        ]
    },
    {
        "category": "household",
        "name": "Lizol Citrus Surface & Floor Disinfectant Cleaner",
        "brand": "Lizol",
        "unit": "mL",
        "unit_value": 500.0,
        "description": "Triple-action floor cleaner that kills 99.9% germs, removes stubborn stains, and leaves a pleasant citrus scent.",
        "image_source": "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 105.00, "quantity": 22, "stock_status": "in_stock", "sku": "HOU-FLR-003"},
            {"shop_slug": "ankola-super-bazar", "price": 100.00, "quantity": 35, "stock_status": "in_stock", "sku": "ASB-FLR-500M"},
        ]
    },
    {
        "category": "household",
        "name": "Scotch-Brite Heavy Duty Scrub Sponge Pack",
        "brand": "Scotch-Brite",
        "unit": "pack",
        "unit_value": 3.0,
        "description": "Ergonomic dual-sided kitchen sponge with non-scratch scrub pad for stainless steel utensils and non-stick cookware.",
        "image_source": "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 75.00, "quantity": 30, "stock_status": "in_stock", "sku": "HOU-SCR-004"},
            {"shop_slug": "ankola-super-bazar", "price": 72.00, "quantity": 40, "stock_status": "in_stock", "sku": "ASB-SCR-3PK"},
        ]
    },
    {
        "category": "household",
        "name": "Harpic Power Plus Disinfectant Toilet Cleaner",
        "brand": "Harpic",
        "unit": "mL",
        "unit_value": 500.0,
        "description": "Thick gel formula with powerful limescale and yellow stain removal, offering hospital-grade hygiene.",
        "image_source": "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 98.00, "quantity": 20, "stock_status": "in_stock", "sku": "HOU-TLT-005"},
            {"shop_slug": "ankola-super-bazar", "price": 94.00, "quantity": 30, "stock_status": "in_stock", "sku": "ASB-TLT-500M"},
        ]
    },

    # ---------------------------------------------------------
    # 10. PHARMACY
    # ---------------------------------------------------------
    {
        "category": "pharmacy",
        "name": "Dolo 650mg Paracetamol Tablets",
        "brand": "Micro Labs",
        "unit": "pack",
        "unit_value": 15.0,
        "description": "Analgesic and antipyretic tablets trusted for effective relief from fever, headache, body aches, and cold symptoms.",
        "image_source": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 32.00, "quantity": 40, "stock_status": "in_stock", "sku": "PHA-DOL-001"},
            {"shop_slug": "ankola-super-bazar", "price": 30.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-DOL-15TB"},
        ]
    },
    {
        "category": "pharmacy",
        "name": "Crocin Advance Fast Action Tablets",
        "brand": "GlaxoSmithKline",
        "unit": "pack",
        "unit_value": 20.0,
        "description": "Optizorb technology begins releasing medicine in as little as 5 minutes for rapid fever and headache relief.",
        "image_source": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 45.00, "quantity": 35, "stock_status": "in_stock", "sku": "PHA-CRO-002"},
            {"shop_slug": "ankola-super-bazar", "price": 42.00, "quantity": 45, "stock_status": "in_stock", "sku": "ASB-CRO-20TB"},
        ]
    },
    {
        "category": "pharmacy",
        "name": "Shelcal 500mg Calcium & Vitamin D3 Tablets",
        "brand": "Torrent Pharma",
        "unit": "pack",
        "unit_value": 15.0,
        "description": "High absorption elemental calcium with Vitamin D3 formulation to strengthen bone density and joint mobility.",
        "image_source": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 135.00, "quantity": 20, "stock_status": "in_stock", "sku": "PHA-SHL-003"},
            {"shop_slug": "ankola-super-bazar", "price": 128.00, "quantity": 25, "stock_status": "in_stock", "sku": "ASB-SHL-15TB"},
        ]
    },
    {
        "category": "pharmacy",
        "name": "Dr. Morepen Digital Clinical Body Thermometer",
        "brand": "Dr. Morepen",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "High accuracy quick digital fever thermometer with clear LCD readout, beeper alert, and auto shut-off.",
        "image_source": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 199.00, "quantity": 10, "stock_status": "in_stock", "sku": "PHA-THM-004"},
            {"shop_slug": "ankola-super-bazar", "price": 185.00, "quantity": 15, "stock_status": "in_stock", "sku": "ASB-THM-1PC"},
        ]
    },
    {
        "category": "pharmacy",
        "name": "Moov Fast Pain Relief Herbal Spray",
        "brand": "Moov",
        "unit": "g",
        "unit_value": 50.0,
        "description": "100% natural Ayurvedic active spray with eucalyptus, turpentine, and wintergreen oil for instant muscle pain relief.",
        "image_source": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 175.00, "quantity": 15, "stock_status": "in_stock", "sku": "PHA-MOV-005"},
            {"shop_slug": "ankola-super-bazar", "price": 168.00, "quantity": 20, "stock_status": "in_stock", "sku": "ASB-MOV-50G"},
        ]
    },

    # ---------------------------------------------------------
    # 11. STATIONERY & OFFICE
    # ---------------------------------------------------------
    {
        "category": "stationery",
        "name": "Classmate Pulse Hardbound Ruled A5 Notebook",
        "brand": "Classmate",
        "unit": "piece",
        "unit_value": 1.0,
        "description": "300-page single ruled notebook with chlorine-free smooth paper and durable stain-resistant hardcover.",
        "image_source": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 95.00, "quantity": 30, "stock_status": "in_stock", "sku": "STA-NOT-001"},
            {"shop_slug": "ankola-super-bazar", "price": 90.00, "quantity": 50, "stock_status": "in_stock", "sku": "ASB-NOT-A5"},
        ]
    },
    {
        "category": "stationery",
        "name": "Reynolds 045 Fine Carbure Blue Ball Pens",
        "brand": "Reynolds",
        "unit": "pack",
        "unit_value": 5.0,
        "description": "India's beloved 0.7mm fine tip ballpoint pens with smudge-free laser tip for effortless non-stop writing.",
        "image_source": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 50.00, "quantity": 40, "stock_status": "in_stock", "sku": "STA-PEN-002"},
            {"shop_slug": "ankola-super-bazar", "price": 45.00, "quantity": 60, "stock_status": "in_stock", "sku": "ASB-PEN-5PK"},
        ]
    },
    {
        "category": "stationery",
        "name": "Camlin Whiteboard Marker Assorted 4-Color Set",
        "brand": "Camlin",
        "unit": "pack",
        "unit_value": 4.0,
        "description": "Bold ink whiteboard markers in Black, Blue, Red, and Green. Easy dry-wipe formula without ghosting.",
        "image_source": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 120.00, "quantity": 18, "stock_status": "in_stock", "sku": "STA-MRK-003"},
            {"shop_slug": "ankola-super-bazar", "price": 110.00, "quantity": 25, "stock_status": "in_stock", "sku": "ASB-MRK-4PK"},
        ]
    },
    {
        "category": "stationery",
        "name": "JK Copier A4 Multipurpose Paper 75GSM",
        "brand": "JK Paper",
        "unit": "pack",
        "unit_value": 500.0,
        "description": "High brightness 75GSM printer and photocopy paper ream, engineered for jam-free high-speed double-sided printing.",
        "image_source": "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 360.00, "quantity": 12, "stock_status": "in_stock", "sku": "STA-PPR-004"},
            {"shop_slug": "ankola-super-bazar", "price": 340.00, "quantity": 20, "stock_status": "in_stock", "sku": "ASB-PPR-500S"},
        ]
    },
    {
        "category": "stationery",
        "name": "Doms Neon Rubber Tipped Graphite Pencils",
        "brand": "Doms",
        "unit": "pack",
        "unit_value": 10.0,
        "description": "Premium 2B dark graphite lead pencils with vibrant neon wooden barrels and soft integrated eraser tips.",
        "image_source": "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=600&auto=format&fit=crop&q=80",
        "shops": [
            {"shop_slug": "sri-ganesh-stores", "price": 60.00, "quantity": 30, "stock_status": "in_stock", "sku": "STA-PNC-005"},
            {"shop_slug": "ankola-super-bazar", "price": 55.00, "quantity": 40, "stock_status": "in_stock", "sku": "ASB-PNC-10PK"},
        ]
    },
]
