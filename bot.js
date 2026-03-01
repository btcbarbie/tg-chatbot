// ============================
// SECTION 1: SETUP
// ============================
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ============================
// SECTION 2: TRAVEL AGENCY DATA
// ============================
const destinations = {
    maldives: {
        name: '🏝️ Maldives',
        description: 'Crystal clear waters, luxury resorts, and unforgettable sunsets.',
        packages: {
            budget: { name: 'Island Escape', price: '$1,200', duration: '5 days', details: 'Beach bungalow, breakfast included, airport transfers' },
            mid: { name: 'Ocean Bliss', price: '$2,500', duration: '7 days', details: 'Water villa, all meals, snorkeling tour, spa session' },
            luxury: { name: 'Royal Maldives', price: '$5,000', duration: '10 days', details: 'Private overwater villa, all-inclusive, diving, private yacht tour' }
        }
    },
    paris: {
        name: '🗼 Paris',
        description: 'The city of love, art, and world-class cuisine.',
        packages: {
            budget: { name: 'Paris Express', price: '$800', duration: '4 days', details: '3-star hotel, metro pass, guided Eiffel Tower visit' },
            mid: { name: 'Parisian Dream', price: '$1,800', duration: '6 days', details: '4-star hotel, museum pass, Seine river cruise, food tour' },
            luxury: { name: 'Luxe Paris', price: '$4,000', duration: '8 days', details: '5-star Champs-Elysees hotel, private tours, Michelin dining' }
        }
    },
    dubai: {
        name: '🏙️ Dubai',
        description: 'Futuristic skyline, desert adventures, and luxury shopping.',
        packages: {
            budget: { name: 'Dubai Discovery', price: '$900', duration: '4 days', details: 'City hotel, Burj Khalifa visit, Dubai Mall tour' },
            mid: { name: 'Desert & City', price: '$2,000', duration: '6 days', details: 'Marina hotel, desert safari, dhow cruise, city tour' },
            luxury: { name: 'Ultimate Dubai', price: '$5,500', duration: '8 days', details: 'Burj Al Arab, helicopter tour, private desert camp, yacht party' }
        }
    },
    zanzibar: {
        name: '🌴 Zanzibar',
        description: 'Tropical paradise with rich culture and stunning beaches.',
        packages: {
            budget: { name: 'Zanzibar Basics', price: '$600', duration: '5 days', details: 'Guesthouse stay, Stone Town tour, beach day' },
            mid: { name: 'Spice Island', price: '$1,400', duration: '7 days', details: 'Boutique hotel, spice tour, dolphin trip, snorkeling' },
            luxury: { name: 'Zanzibar Elite', price: '$3,200', duration: '10 days', details: 'Private beach villa, all-inclusive, diving, sunset cruise' }
        }
    },
    nigeria: {
        name: '🇳🇬 Nigeria',
        description: 'Country in West Africa with rich culture.',
        packages: {
            budget: { name: 'Nigeria Bare', price: '$700', duration: '4 days', details: 'Guesthouse stay, Africa museum, bukka' },
            mid: { name: 'Nigeria Upgraded', price: '$2,000', duration: '8 days', details: '4.5 star hotel, inter-city tour, showbiz' },
            luxury: { name: 'Nigeria Creme de la Creme', price: '$5,000', duration: '8 days', details: '5 star hotel, 5 star restaurants, private yacht and beach tour' }
        }
    }
};

// ============================
// SECTION 3: USER SESSIONS
// ============================
const userSessions = {};

// ============================
// SECTION 4: /start COMMAND
// ============================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;

    userSessions[chatId] = { step: 'choosing_destination' };

    bot.sendMessage(chatId,
        '🌍 Welcome to Isis Travel Agency, ' + userName + '!\n\n' +
        'We\'ll help you find the perfect travel package.\n\n' +
        'Where would you like to go?',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏝️ Maldives', callback_data: 'dest_maldives' }],
                    [{ text: '🗼 Paris', callback_data: 'dest_paris' }],
                    [{ text: '🏙️ Dubai', callback_data: 'dest_dubai' }],
                    [{ text: '🌴 Zanzibar', callback_data: 'dest_zanzibar' }],
                    [{ text: '🇳🇬 Nigeria', callback_data: 'dest_nigeria' }]
                ]
            }
        }
    );
});

// ============================
// SECTION 5: HANDLE BUTTON CLICKS
// ============================
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!userSessions[chatId]) {
        userSessions[chatId] = { step: 'choosing_destination' };
    }

    const session = userSessions[chatId];

    // --- DESTINATION SELECTED ---
    if (data.startsWith('dest_')) {
        const destKey = data.replace('dest_', '');
        const dest = destinations[destKey];

        session.destination = destKey;
        session.step = 'entering_dates';

        bot.sendMessage(chatId,
            'Great choice! You selected ' + dest.name + '\n\n' +
            dest.description + '\n\n' +
            '📅 When would you like to travel?\n' +
            'Please type your preferred dates (e.g., "March 15 - March 22")'
        );
    }

    // --- BUDGET SELECTED ---
    else if (data.startsWith('budget_')) {
        const budgetKey = data.replace('budget_', '');
        const dest = destinations[session.destination];
        const pkg = dest.packages[budgetKey];

        session.budget = budgetKey;
        session.step = 'viewing_package';

        bot.sendMessage(chatId,
            '✨ Here is your perfect package:\n\n' +
            '━━━━━━━━━━━━━━━━━━━━\n' +
            '📦 ' + pkg.name + '\n' +
            '📍 Destination: ' + dest.name + '\n' +
            '📅 Dates: ' + session.dates + '\n' +
            '⏱️ Duration: ' + pkg.duration + '\n' +
            '💰 Price: ' + pkg.price + ' per person\n\n' +
            '📋 Includes:\n' + pkg.details + '\n' +
            '━━━━━━━━━━━━━━━━━━━━\n\n' +
            'Would you like to proceed?',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Book Now - Contact Us', callback_data: 'contact' }],
                        [{ text: '🔄 Start Over', callback_data: 'restart' }]
                    ]
                }
            }
        );
    }

    // --- CONTACT / BOOK NOW ---
    else if (data === 'contact') {
        session.step = 'contact';

        bot.sendMessage(chatId,
            '📞 Contact Isis Travel Agency\n\n' +
            'We\'d love to finalize your booking!\n\n' +
            '📧 Email: bookings@isistravel.com\n' +
            '📱 Phone: +254 700 123 456\n' +
            '🌐 Website: www.isistravel.com\n' +
            '📍 Office: Nairobi, Kenya\n\n' +
            'Or type your name and phone number below and we\'ll call you back!'
        );
    }

    // --- RESTART ---
    else if (data === 'restart') {
        userSessions[chatId] = { step: 'choosing_destination' };

        bot.sendMessage(chatId,
            '🔄 No problem! Let\'s start fresh.\n\nWhere would you like to go?',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🏝️ Maldives', callback_data: 'dest_maldives' }],
                        [{ text: '🗼 Paris', callback_data: 'dest_paris' }],
                        [{ text: '🏙️ Dubai', callback_data: 'dest_dubai' }],
                        [{ text: '🌴 Zanzibar', callback_data: 'dest_zanzibar' }],
                        [{ text: '🇳🇬 Nigeria', callback_data: 'dest_nigeria' }]
                    ]
                }
            }
        );
    }

    bot.answerCallbackQuery(query.id);
});

// ============================
// SECTION 6: HANDLE TEXT MESSAGES
// ============================
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    const session = userSessions[chatId];

    if (!session) {
        bot.sendMessage(chatId, '👋 Type /start to begin exploring destinations!');
        return;
    }

    // --- USER IS ENTERING TRAVEL DATES ---
    if (session.step === 'entering_dates') {
        session.dates = text;
        session.step = 'choosing_budget';

        bot.sendMessage(chatId,
            '📅 Got it! You want to travel: ' + text + '\n\n' +
            '💰 What\'s your budget range?',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💵 Budget-Friendly', callback_data: 'budget_budget' }],
                        [{ text: '💳 Mid-Range', callback_data: 'budget_mid' }],
                        [{ text: '💎 Luxury', callback_data: 'budget_luxury' }]
                    ]
                }
            }
        );
    }

    // --- USER IS PROVIDING CONTACT INFO ---
    else if (session.step === 'contact') {
        bot.sendMessage(chatId,
            '✅ Thank you! We\'ve received your info:\n\n' +
            '"' + text + '"\n\n' +
            'Our travel consultant will reach out to you within 24 hours. ✈️\n\n' +
            'Type /start to explore more destinations!'
        );

        delete userSessions[chatId];
    }
});

console.log('✈️ Isis Travel Bot is running...');
