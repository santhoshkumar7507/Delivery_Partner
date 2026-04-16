import random
from decimal import Decimal
from datetime import time

from django.core.management.base import BaseCommand
from django.db import transaction

from users.models import User, VendorProfile, DeliveryPartnerProfile, CustomerProfile
from restaurants.models import Restaurant, MenuCategory, MenuItem
from orders.models import Order, OrderItem, OrderStatusHistory
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Load dummy data for the Delivery Partner application'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        Notification.objects.all().delete()
        OrderStatusHistory.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        MenuItem.objects.all().delete()
        MenuCategory.objects.all().delete()
        Restaurant.objects.all().delete()
        CustomerProfile.objects.all().delete()
        DeliveryPartnerProfile.objects.all().delete()
        VendorProfile.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write('Creating users...')

        # Admin user
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@deliverypartner.com',
            password='admin123456',
            first_name='Super',
            last_name='Admin',
            role='admin',
            phone='+919000000001',
            is_verified=True,
        )
        self.stdout.write(self.style.SUCCESS(f'  Admin: admin / admin123456'))

        # Vendor users
        vendors_data = [
            {
                'username': 'vendor_spice',
                'email': 'spice@deliverypartner.com',
                'first_name': 'Raj',
                'last_name': 'Sharma',
                'phone': '+919000000010',
                'company_name': 'Spice Garden Restaurant',
                'gst_number': 'GST29ABCDE1234F1Z5',
            },
            {
                'username': 'vendor_pizza',
                'email': 'pizza@deliverypartner.com',
                'first_name': 'Marco',
                'last_name': 'Rossi',
                'phone': '+919000000011',
                'company_name': 'Pizza Paradise',
                'gst_number': 'GST29FGHIJ5678K2Z6',
            },
            {
                'username': 'vendor_dragon',
                'email': 'dragon@deliverypartner.com',
                'first_name': 'Wei',
                'last_name': 'Chen',
                'phone': '+919000000012',
                'company_name': 'Dragon Wok',
                'gst_number': 'GST29KLMNO9012L3Z7',
            },
            {
                'username': 'vendor_burger',
                'email': 'burger@deliverypartner.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'phone': '+919000000013',
                'company_name': 'Burger Barn',
                'gst_number': 'GST29PQRST3456M4Z8',
            },
            {
                'username': 'vendor_sushi',
                'email': 'sushi@deliverypartner.com',
                'first_name': 'Yuki',
                'last_name': 'Tanaka',
                'phone': '+919000000014',
                'company_name': 'Sushi Zen',
                'gst_number': 'GST29UVWXY7890N5Z9',
            },
        ]

        vendors = []
        for vd in vendors_data:
            company = vd.pop('company_name')
            gst = vd.pop('gst_number')
            user = User.objects.create_user(
                password='vendor123456',
                role='vendor',
                is_verified=True,
                **vd,
            )
            VendorProfile.objects.create(
                user=user,
                company_name=company,
                gst_number=gst,
                is_approved=True,
            )
            vendors.append(user)
            self.stdout.write(self.style.SUCCESS(f'  Vendor: {user.username} / vendor123456'))

        # Delivery partners
        delivery_data = [
            {
                'username': 'delivery_ravi',
                'email': 'ravi@deliverypartner.com',
                'first_name': 'Ravi',
                'last_name': 'Kumar',
                'phone': '+919000000020',
                'vehicle_type': 'motorcycle',
                'vehicle_number': 'KA-01-AB-1234',
            },
            {
                'username': 'delivery_amit',
                'email': 'amit@deliverypartner.com',
                'first_name': 'Amit',
                'last_name': 'Patel',
                'phone': '+919000000021',
                'vehicle_type': 'scooter',
                'vehicle_number': 'KA-02-CD-5678',
            },
            {
                'username': 'delivery_suresh',
                'email': 'suresh@deliverypartner.com',
                'first_name': 'Suresh',
                'last_name': 'Reddy',
                'phone': '+919000000022',
                'vehicle_type': 'bicycle',
                'vehicle_number': 'N/A',
            },
        ]

        delivery_partners = []
        for dd in delivery_data:
            vtype = dd.pop('vehicle_type')
            vnum = dd.pop('vehicle_number')
            user = User.objects.create_user(
                password='delivery123456',
                role='delivery_partner',
                is_verified=True,
                **dd,
            )
            DeliveryPartnerProfile.objects.create(
                user=user,
                vehicle_type=vtype,
                vehicle_number=vnum,
                is_available=True,
                is_approved=True,
                current_latitude=Decimal('12.9716'),
                current_longitude=Decimal('77.5946'),
            )
            delivery_partners.append(user)
            self.stdout.write(self.style.SUCCESS(f'  Delivery: {user.username} / delivery123456'))

        # Customer users
        customers_data = [
            {
                'username': 'customer_alice',
                'email': 'alice@gmail.com',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'phone': '+919000000030',
                'address': '123 MG Road, Bangalore',
            },
            {
                'username': 'customer_bob',
                'email': 'bob@gmail.com',
                'first_name': 'Bob',
                'last_name': 'Williams',
                'phone': '+919000000031',
                'address': '456 Brigade Road, Bangalore',
            },
            {
                'username': 'customer_priya',
                'email': 'priya@gmail.com',
                'first_name': 'Priya',
                'last_name': 'Nair',
                'phone': '+919000000032',
                'address': '789 Koramangala, Bangalore',
            },
        ]

        customers = []
        for cd in customers_data:
            addr = cd.pop('address', '')
            user = User.objects.create_user(
                password='customer123456',
                role='customer',
                is_verified=True,
                address=addr,
                **cd,
            )
            CustomerProfile.objects.create(
                user=user,
                default_address=addr,
                latitude=Decimal('12.9716') + Decimal(str(random.uniform(-0.05, 0.05))),
                longitude=Decimal('77.5946') + Decimal(str(random.uniform(-0.05, 0.05))),
            )
            customers.append(user)
            self.stdout.write(self.style.SUCCESS(f'  Customer: {user.username} / customer123456'))

        # ---------------------------------------------------------------
        # Restaurants and menus
        # ---------------------------------------------------------------
        self.stdout.write('\nCreating restaurants and menus...')

        restaurants_data = [
            {
                'vendor': vendors[0],
                'name': 'Maharaja Royal Feast',
                'description': 'Authentic Indian cuisine with a modern twist. Fresh spices sourced from Kerala.',
                'address': '42 Commercial Street, Bangalore 560001',
                'latitude': Decimal('12.9780'),
                'longitude': Decimal('77.6080'),
                'phone': '+918000000001',
                'cuisine_type': 'indian',
                'opening_time': time(8, 0),
                'closing_time': time(23, 0),
                'is_featured': True,
                'average_rating': Decimal('4.50'),
                'total_ratings': 342,
                'min_order_amount': Decimal('150.00'),
                'delivery_fee': Decimal('30.00'),
                'estimated_delivery_time': 35,
                'categories': [
                    {
                        'name': 'Starters',
                        'items': [
                            {'name': 'Paneer Tikka', 'price': Decimal('220.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Marinated cottage cheese grilled to perfection'},
                            {'name': 'Chicken 65', 'price': Decimal('250.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Spicy deep-fried chicken'},
                            {'name': 'Samosa (2 pcs)', 'price': Decimal('80.00'), 'is_veg': True, 'description': 'Crispy pastry filled with spiced potatoes'},
                            {'name': 'Fish Fry', 'price': Decimal('280.00'), 'is_veg': False, 'description': 'Masala-coated fried fish fillets'},
                        ]
                    },
                    {
                        'name': 'Main Course',
                        'items': [
                            {'name': 'Butter Chicken', 'price': Decimal('320.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Tender chicken in rich tomato-butter gravy'},
                            {'name': 'Dal Makhani', 'price': Decimal('220.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Slow-cooked black lentils in creamy gravy'},
                            {'name': 'Palak Paneer', 'price': Decimal('240.00'), 'is_veg': True, 'description': 'Cottage cheese in spinach gravy'},
                            {'name': 'Chicken Biryani', 'price': Decimal('280.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Fragrant basmati rice with spiced chicken'},
                            {'name': 'Veg Biryani', 'price': Decimal('220.00'), 'is_veg': True, 'description': 'Aromatic rice with mixed vegetables'},
                        ]
                    },
                    {
                        'name': 'Breads',
                        'items': [
                            {'name': 'Butter Naan', 'price': Decimal('50.00'), 'is_veg': True, 'description': 'Soft bread brushed with butter'},
                            {'name': 'Garlic Naan', 'price': Decimal('60.00'), 'is_veg': True, 'description': 'Naan topped with garlic'},
                            {'name': 'Tandoori Roti', 'price': Decimal('30.00'), 'is_veg': True, 'description': 'Whole wheat bread from tandoor'},
                        ]
                    },
                    {
                        'name': 'Desserts',
                        'items': [
                            {'name': 'Gulab Jamun (2 pcs)', 'price': Decimal('100.00'), 'is_veg': True, 'description': 'Deep-fried milk dumplings in sugar syrup'},
                            {'name': 'Rasmalai', 'price': Decimal('120.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Soft paneer balls in saffron milk'},
                        ]
                    },
                ],
            },
            {
                'vendor': vendors[1],
                'name': 'Neon Slice Pizzeria',
                'description': 'Wood-fired pizzas and Italian classics. Dough made fresh daily.',
                'address': '15 Indiranagar, Bangalore 560038',
                'latitude': Decimal('12.9784'),
                'longitude': Decimal('77.6408'),
                'phone': '+918000000002',
                'cuisine_type': 'italian',
                'opening_time': time(11, 0),
                'closing_time': time(23, 30),
                'is_featured': True,
                'average_rating': Decimal('4.30'),
                'total_ratings': 512,
                'min_order_amount': Decimal('200.00'),
                'delivery_fee': Decimal('40.00'),
                'estimated_delivery_time': 30,
                'categories': [
                    {
                        'name': 'Pizzas',
                        'items': [
                            {'name': 'Margherita', 'price': Decimal('250.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Classic tomato, mozzarella, basil'},
                            {'name': 'Pepperoni Pizza', 'price': Decimal('350.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Loaded with spicy pepperoni'},
                            {'name': 'BBQ Chicken Pizza', 'price': Decimal('380.00'), 'is_veg': False, 'description': 'BBQ sauce, grilled chicken, onions'},
                            {'name': 'Veggie Supreme', 'price': Decimal('320.00'), 'is_veg': True, 'description': 'Bell peppers, olives, mushrooms, onions'},
                            {'name': 'Four Cheese Pizza', 'price': Decimal('360.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Mozzarella, cheddar, parmesan, gorgonzola'},
                        ]
                    },
                    {
                        'name': 'Pasta',
                        'items': [
                            {'name': 'Spaghetti Carbonara', 'price': Decimal('280.00'), 'is_veg': False, 'description': 'Creamy egg-based sauce with bacon'},
                            {'name': 'Penne Arrabbiata', 'price': Decimal('240.00'), 'is_veg': True, 'description': 'Spicy tomato sauce with garlic'},
                            {'name': 'Alfredo Pasta', 'price': Decimal('260.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Creamy white sauce pasta'},
                        ]
                    },
                    {
                        'name': 'Sides & Drinks',
                        'items': [
                            {'name': 'Garlic Bread (4 pcs)', 'price': Decimal('150.00'), 'is_veg': True, 'description': 'Toasted bread with garlic butter'},
                            {'name': 'Caesar Salad', 'price': Decimal('180.00'), 'is_veg': True, 'description': 'Romaine lettuce with caesar dressing'},
                            {'name': 'Tiramisu', 'price': Decimal('200.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Classic Italian coffee-flavored dessert'},
                        ]
                    },
                ],
            },
            {
                'vendor': vendors[2],
                'name': 'Cyberpunk Wok Fusion',
                'description': 'Authentic Chinese and Asian fusion cuisine. Wok-tossed perfection.',
                'address': '88 Koramangala 5th Block, Bangalore 560095',
                'latitude': Decimal('12.9352'),
                'longitude': Decimal('77.6245'),
                'phone': '+918000000003',
                'cuisine_type': 'chinese',
                'opening_time': time(11, 30),
                'closing_time': time(22, 30),
                'is_featured': True,
                'average_rating': Decimal('4.20'),
                'total_ratings': 289,
                'min_order_amount': Decimal('180.00'),
                'delivery_fee': Decimal('35.00'),
                'estimated_delivery_time': 40,
                'categories': [
                    {
                        'name': 'Soups',
                        'items': [
                            {'name': 'Hot & Sour Soup', 'price': Decimal('150.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Spicy and tangy vegetable soup'},
                            {'name': 'Manchow Soup', 'price': Decimal('160.00'), 'is_veg': True, 'description': 'Thick spicy soup with crispy noodles'},
                            {'name': 'Chicken Wonton Soup', 'price': Decimal('180.00'), 'is_veg': False, 'description': 'Clear broth with chicken wontons'},
                        ]
                    },
                    {
                        'name': 'Starters',
                        'items': [
                            {'name': 'Spring Rolls (4 pcs)', 'price': Decimal('180.00'), 'is_veg': True, 'description': 'Crispy rolls filled with vegetables'},
                            {'name': 'Chilli Chicken', 'price': Decimal('260.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Spicy fried chicken with peppers'},
                            {'name': 'Crispy Corn', 'price': Decimal('180.00'), 'is_veg': True, 'description': 'Crispy fried corn with spices'},
                            {'name': 'Dragon Chicken', 'price': Decimal('280.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Signature spicy chicken dish'},
                        ]
                    },
                    {
                        'name': 'Main Course',
                        'items': [
                            {'name': 'Veg Fried Rice', 'price': Decimal('200.00'), 'is_veg': True, 'description': 'Wok-tossed rice with vegetables'},
                            {'name': 'Chicken Fried Rice', 'price': Decimal('240.00'), 'is_veg': False, 'description': 'Wok-tossed rice with chicken'},
                            {'name': 'Hakka Noodles', 'price': Decimal('200.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Stir-fried noodles with vegetables'},
                            {'name': 'Schezwan Noodles', 'price': Decimal('220.00'), 'is_veg': True, 'description': 'Spicy Sichuan-style noodles'},
                            {'name': 'Kung Pao Chicken', 'price': Decimal('300.00'), 'is_veg': False, 'description': 'Stir-fried chicken with peanuts'},
                        ]
                    },
                ],
            },
            {
                'vendor': vendors[3],
                'name': 'Aerosmith Burgers',
                'description': 'Juicy gourmet burgers and loaded fries. 100% fresh ingredients.',
                'address': '22 HSR Layout, Bangalore 560102',
                'latitude': Decimal('12.9116'),
                'longitude': Decimal('77.6389'),
                'phone': '+918000000004',
                'cuisine_type': 'fast_food',
                'opening_time': time(10, 0),
                'closing_time': time(23, 0),
                'is_featured': False,
                'average_rating': Decimal('4.10'),
                'total_ratings': 198,
                'min_order_amount': Decimal('100.00'),
                'delivery_fee': Decimal('25.00'),
                'estimated_delivery_time': 25,
                'categories': [
                    {
                        'name': 'Burgers',
                        'items': [
                            {'name': 'Classic Cheese Burger', 'price': Decimal('180.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Beef patty with cheese, lettuce, tomato'},
                            {'name': 'Veggie Burger', 'price': Decimal('150.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Crispy vegetable patty with special sauce'},
                            {'name': 'BBQ Bacon Burger', 'price': Decimal('250.00'), 'is_veg': False, 'description': 'Smoky BBQ sauce with crispy bacon'},
                            {'name': 'Mushroom Swiss Burger', 'price': Decimal('220.00'), 'is_veg': True, 'description': 'Sauteed mushrooms with Swiss cheese'},
                            {'name': 'Double Stack Burger', 'price': Decimal('300.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Two patties, double cheese, extra sauce'},
                        ]
                    },
                    {
                        'name': 'Sides',
                        'items': [
                            {'name': 'French Fries', 'price': Decimal('100.00'), 'is_veg': True, 'description': 'Crispy golden french fries'},
                            {'name': 'Loaded Fries', 'price': Decimal('160.00'), 'is_veg': False, 'description': 'Fries with cheese, bacon, jalapenos'},
                            {'name': 'Onion Rings', 'price': Decimal('120.00'), 'is_veg': True, 'description': 'Crispy battered onion rings'},
                            {'name': 'Chicken Wings (6 pcs)', 'price': Decimal('220.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Spicy buffalo chicken wings'},
                        ]
                    },
                    {
                        'name': 'Drinks & Shakes',
                        'items': [
                            {'name': 'Chocolate Milkshake', 'price': Decimal('130.00'), 'is_veg': True, 'is_bestseller': True, 'description': 'Thick chocolate milkshake'},
                            {'name': 'Vanilla Milkshake', 'price': Decimal('120.00'), 'is_veg': True, 'description': 'Classic vanilla milkshake'},
                            {'name': 'Cold Coffee', 'price': Decimal('110.00'), 'is_veg': True, 'description': 'Iced coffee with milk'},
                        ]
                    },
                ],
            },
            {
                'vendor': vendors[4],
                'name': 'Samurai Sushi Co.',
                'description': 'Premium Japanese sushi and ramen. Fish flown in fresh daily.',
                'address': '55 Whitefield, Bangalore 560066',
                'latitude': Decimal('12.9698'),
                'longitude': Decimal('77.7500'),
                'phone': '+918000000005',
                'cuisine_type': 'japanese',
                'opening_time': time(12, 0),
                'closing_time': time(22, 0),
                'is_featured': True,
                'average_rating': Decimal('4.60'),
                'total_ratings': 156,
                'min_order_amount': Decimal('300.00'),
                'delivery_fee': Decimal('50.00'),
                'estimated_delivery_time': 45,
                'categories': [
                    {
                        'name': 'Sushi Rolls',
                        'items': [
                            {'name': 'California Roll (8 pcs)', 'price': Decimal('350.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Crab, avocado, cucumber'},
                            {'name': 'Salmon Nigiri (4 pcs)', 'price': Decimal('400.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Fresh salmon on seasoned rice'},
                            {'name': 'Veggie Maki (6 pcs)', 'price': Decimal('280.00'), 'is_veg': True, 'description': 'Assorted vegetable rolls'},
                            {'name': 'Spicy Tuna Roll (8 pcs)', 'price': Decimal('420.00'), 'is_veg': False, 'description': 'Spicy tuna with sriracha mayo'},
                        ]
                    },
                    {
                        'name': 'Ramen',
                        'items': [
                            {'name': 'Tonkotsu Ramen', 'price': Decimal('380.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Rich pork bone broth ramen'},
                            {'name': 'Miso Ramen', 'price': Decimal('340.00'), 'is_veg': True, 'description': 'Fermented soybean broth ramen'},
                            {'name': 'Spicy Chicken Ramen', 'price': Decimal('360.00'), 'is_veg': False, 'description': 'Spicy broth with grilled chicken'},
                        ]
                    },
                    {
                        'name': 'Sides',
                        'items': [
                            {'name': 'Edamame', 'price': Decimal('150.00'), 'is_veg': True, 'description': 'Steamed salted soybeans'},
                            {'name': 'Gyoza (6 pcs)', 'price': Decimal('250.00'), 'is_veg': False, 'is_bestseller': True, 'description': 'Pan-fried Japanese dumplings'},
                            {'name': 'Miso Soup', 'price': Decimal('120.00'), 'is_veg': True, 'description': 'Traditional fermented soybean soup'},
                        ]
                    },
                ],
            },
        ]

        restaurant_objects = []
        for rd in restaurants_data:
            categories_data = rd.pop('categories')
            restaurant = Restaurant.objects.create(**rd)
            restaurant_objects.append(restaurant)

            for sort_order, cat_data in enumerate(categories_data):
                items_data = cat_data.pop('items')
                category = MenuCategory.objects.create(
                    restaurant=restaurant,
                    name=cat_data['name'],
                    sort_order=sort_order,
                )

                for item_data in items_data:
                    MenuItem.objects.create(
                        category=category,
                        preparation_time=random.randint(10, 25),
                        **item_data,
                    )

            self.stdout.write(self.style.SUCCESS(
                f'  Restaurant: {restaurant.name} ({len(categories_data)} categories)'
            ))

        # ---------------------------------------------------------------
        # Sample orders
        # ---------------------------------------------------------------
        self.stdout.write('\nCreating sample orders...')

        # Order 1: Alice orders from Spice Garden (delivered)
        spice_items = MenuItem.objects.filter(
            category__restaurant=restaurant_objects[0]
        )
        order1 = self._create_order(
            customer=customers[0],
            restaurant=restaurant_objects[0],
            delivery_partner=delivery_partners[0],
            items=[(spice_items[0], 2), (spice_items[4], 1), (spice_items[9], 3)],
            status_progression=[
                'placed', 'confirmed', 'preparing', 'ready_for_pickup',
                'picked_up', 'on_the_way', 'delivered',
            ],
            delivery_address='123 MG Road, Bangalore',
        )
        self.stdout.write(self.style.SUCCESS(f'  Order #{order1.pk}: Delivered'))

        # Order 2: Bob orders from Pizza Paradise (on the way)
        pizza_items = MenuItem.objects.filter(
            category__restaurant=restaurant_objects[1]
        )
        order2 = self._create_order(
            customer=customers[1],
            restaurant=restaurant_objects[1],
            delivery_partner=delivery_partners[1],
            items=[(pizza_items[0], 1), (pizza_items[1], 1), (pizza_items[8], 2)],
            status_progression=[
                'placed', 'confirmed', 'preparing', 'ready_for_pickup',
                'picked_up', 'on_the_way',
            ],
            delivery_address='456 Brigade Road, Bangalore',
        )
        self.stdout.write(self.style.SUCCESS(f'  Order #{order2.pk}: On the way'))

        # Order 3: Priya orders from Dragon Wok (preparing)
        dragon_items = MenuItem.objects.filter(
            category__restaurant=restaurant_objects[2]
        )
        order3 = self._create_order(
            customer=customers[2],
            restaurant=restaurant_objects[2],
            delivery_partner=None,
            items=[(dragon_items[0], 1), (dragon_items[3], 2), (dragon_items[7], 1)],
            status_progression=['placed', 'confirmed', 'preparing'],
            delivery_address='789 Koramangala, Bangalore',
        )
        self.stdout.write(self.style.SUCCESS(f'  Order #{order3.pk}: Preparing'))

        # Order 4: Alice orders from Burger Barn (placed - new)
        burger_items = MenuItem.objects.filter(
            category__restaurant=restaurant_objects[3]
        )
        order4 = self._create_order(
            customer=customers[0],
            restaurant=restaurant_objects[3],
            delivery_partner=None,
            items=[(burger_items[0], 2), (burger_items[5], 1), (burger_items[9], 2)],
            status_progression=['placed'],
            delivery_address='123 MG Road, Bangalore',
        )
        self.stdout.write(self.style.SUCCESS(f'  Order #{order4.pk}: Placed'))

        # Order 5: Bob orders from Sushi Zen (cancelled)
        sushi_items = MenuItem.objects.filter(
            category__restaurant=restaurant_objects[4]
        )
        order5 = self._create_order(
            customer=customers[1],
            restaurant=restaurant_objects[4],
            delivery_partner=None,
            items=[(sushi_items[0], 2), (sushi_items[4], 1)],
            status_progression=['placed', 'cancelled'],
            delivery_address='456 Brigade Road, Bangalore',
        )
        self.stdout.write(self.style.SUCCESS(f'  Order #{order5.pk}: Cancelled'))

        # ---------------------------------------------------------------
        # Notifications
        # ---------------------------------------------------------------
        self.stdout.write('\nCreating sample notifications...')

        for customer in customers:
            Notification.objects.create(
                user=customer,
                title='Welcome to Delivery Partner!',
                message='Welcome to our food delivery platform. Browse restaurants and place your first order!',
                notification_type='general',
            )

        for vendor in vendors:
            Notification.objects.create(
                user=vendor,
                title='Account Approved',
                message='Your vendor account has been approved. You can now manage your restaurant.',
                notification_type='account_approved',
            )

        for dp in delivery_partners:
            Notification.objects.create(
                user=dp,
                title='Account Approved',
                message='Your delivery partner account has been approved. You can now accept deliveries.',
                notification_type='account_approved',
            )

        self.stdout.write(self.style.SUCCESS(
            f'\nDummy data loaded successfully!'
            f'\n\n--- Login Credentials ---'
            f'\nAdmin:     admin / admin123456'
            f'\nVendors:   vendor_spice, vendor_pizza, vendor_dragon, vendor_burger, vendor_sushi / vendor123456'
            f'\nDelivery:  delivery_ravi, delivery_amit, delivery_suresh / delivery123456'
            f'\nCustomers: customer_alice, customer_bob, customer_priya / customer123456'
        ))

    def _create_order(self, customer, restaurant, delivery_partner, items,
                      status_progression, delivery_address):
        """Helper to create an order with items and status history."""
        total = Decimal('0.00')
        for menu_item, qty in items:
            total += menu_item.price * qty

        delivery_fee = restaurant.delivery_fee
        grand_total = total + delivery_fee

        order = Order.objects.create(
            customer=customer,
            restaurant=restaurant,
            delivery_partner=delivery_partner,
            status=status_progression[-1],
            total_amount=total,
            delivery_fee=delivery_fee,
            grand_total=grand_total,
            delivery_address=delivery_address,
            delivery_latitude=Decimal('12.9716') + Decimal(str(random.uniform(-0.05, 0.05))),
            delivery_longitude=Decimal('77.5946') + Decimal(str(random.uniform(-0.05, 0.05))),
            payment_method='cod',
            payment_status='paid' if 'delivered' in status_progression else 'pending',
        )

        for menu_item, qty in items:
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=qty,
                price=menu_item.price,
                subtotal=menu_item.price * qty,
            )

        # Create status history
        prev_status = ''
        for s in status_progression:
            OrderStatusHistory.objects.create(
                order=order,
                old_status=prev_status,
                new_status=s,
                changed_by=customer,
                notes=f'Status changed to {s}',
            )
            prev_status = s

        return order
