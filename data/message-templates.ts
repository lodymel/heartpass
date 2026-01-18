import { MoodType } from '@/types';

export type MessageTemplate = {
  mood: MoodType;
  message: string;
};

// Helper function to replace placeholders
export function formatMessage(template: string, recipientName?: string, senderName?: string): string {
  return template
    .replace(/\{recipientName\}/g, recipientName || 'you')
    .replace(/\{senderName\}/g, senderName || 'I')
    .replace(/\{recipient\}/g, recipientName || 'you')
    .replace(/\{sender\}/g, senderName || 'I');
}

// Message templates for each gift type
export const messageTemplates: Record<string, MessageTemplate[]> = {
  'full-body-massage': [
    // Cute (5)
    { mood: 'cute', message: 'Time to relax and let me take care of you! 💆‍♀️✨ You deserve this moment of pure bliss!' },
    { mood: 'cute', message: '60 minutes of just you and me, and lots of love! 💕 Let\'s melt away all your stress together!' },
    { mood: 'cute', message: 'Your personal spa session is ready! 🛁✨ Close your eyes and let me work my magic!' },
    { mood: 'cute', message: 'No stress allowed! Just pure relaxation and tender care from me to you 💝' },
    { mood: 'cute', message: 'You\'ve been working so hard. Time to unwind and let me pamper you! 💆‍♀️💕' },
    
    // Fun (5)
    { mood: 'fun', message: 'Get ready for the best 60 minutes of your week! 💆‍♀️🎉 Stress, you\'re officially evicted!' },
    { mood: 'fun', message: 'Massage time! No phones, no worries, just pure relaxation vibes! ✨💆‍♀️' },
    { mood: 'fun', message: 'Your body called, and I answered! Time for some serious pampering! 💪💕' },
    { mood: 'fun', message: '60 minutes where the only thing you need to do is... nothing! Enjoy! 🎊💆‍♀️' },
    { mood: 'fun', message: 'Warning: Extreme relaxation ahead! Proceed with caution (and a smile)! 😄💆‍♀️' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'You give so much to others. Now it\'s time to receive. Let me take care of you, my love 💝' },
    { mood: 'heartfelt', message: 'This is my way of saying thank you for everything you do. You deserve this moment of peace 💕' },
    { mood: 'heartfelt', message: '60 minutes dedicated entirely to your wellbeing. Because you matter so much to me 💖' },
    { mood: 'heartfelt', message: 'Let me ease your worries and show you how much I care through this moment of pure relaxation 💝' },
    { mood: 'heartfelt', message: 'Your comfort and happiness mean everything to me. Enjoy this gift of peace and tranquility 💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating you! 🎉 A full body massage to honor how amazing you are! 💆‍♀️✨' },
    { mood: 'event', message: 'Special occasion calls for special treatment! Here\'s to you and your amazing self! 🎊💕' },
    { mood: 'event', message: 'This is your moment! A luxurious massage to celebrate everything wonderful about you! 💆‍♀️🎉' },
    { mood: 'event', message: 'Time to celebrate with the ultimate relaxation experience! You\'ve earned this! 🎈💆‍♀️' },
    { mood: 'event', message: 'A special gift for a special person! Enjoy this moment of pure bliss! 🎉💝' },
  ],

  'coffee-dessert-day': [
    // Cute (5)
    { mood: 'cute', message: 'All the coffee and desserts your heart desires! ☕🍰 Let\'s make today extra sweet together! 💕' },
    { mood: 'cute', message: 'Sweet tooth activated! 🍫✨ Today is all about indulging in your favorite treats!' },
    { mood: 'cute', message: 'Coffee runs and dessert adventures await! ☕🍰 Ready for the sweetest day ever? 💝' },
    { mood: 'cute', message: 'Unlimited sweetness coming your way! ☕🍰 Let\'s explore every café and dessert spot together! 💕' },
    { mood: 'cute', message: 'Today\'s mission: find the most delicious treats! ☕🍰 Let\'s go on a sweet adventure! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Caffeine and sugar overload approved! ☕🍰 Let\'s hit every café and dessert spot in town! 🎉' },
    { mood: 'fun', message: 'Warning: Extreme sweetness ahead! ☕🍰 Prepare for the ultimate dessert marathon! 🍫🎊' },
    { mood: 'fun', message: 'Coffee crawl + dessert tour = the perfect day! ☕🍰 Let\'s make it legendary! 🎉' },
    { mood: 'fun', message: 'No limits, just pure indulgence! ☕🍰 Today we\'re going all out on coffee and desserts! 🎊' },
    { mood: 'fun', message: 'Café hopping and dessert hunting mode: ACTIVATED! ☕🍰 Let\'s do this! 🚀' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'A whole day dedicated to your favorite things. Because you deserve every moment of joy ☕🍰💝' },
    { mood: 'heartfelt', message: 'Let\'s slow down and savor the simple pleasures together. Coffee, desserts, and us ☕🍰💕' },
    { mood: 'heartfelt', message: 'Today is about creating sweet memories together, one café and dessert at a time ☕🍰💖' },
    { mood: 'heartfelt', message: 'The best days are made of good coffee, great desserts, and even better company ☕🍰💝' },
    { mood: 'heartfelt', message: 'Let\'s take our time and enjoy every sip, every bite, every moment together ☕🍰💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with unlimited coffee and desserts! ☕🍰🎉 Today is all about indulgence! ✨' },
    { mood: 'event', message: 'Special day calls for special treats! ☕🍰 Let\'s make this celebration extra sweet! 🎊' },
    { mood: 'event', message: 'A day of pure celebration! ☕🍰 Coffee, desserts, and endless joy! 🎉💕' },
    { mood: 'event', message: 'Marking this occasion with the sweetest day ever! ☕🍰 Let\'s celebrate in style! 🎈' },
    { mood: 'event', message: 'This calls for a coffee and dessert extravaganza! ☕🍰🎉 Let\'s make it unforgettable! ✨' },
  ],

  'spa-day': [
    // Cute (5)
    { mood: 'cute', message: 'Your personal spa day is here! 🛁✨ Time to relax, unwind, and just be you! 💕' },
    { mood: 'cute', message: 'No plans, no stress, just pure relaxation! 🛁💝 Today is all about you!' },
    { mood: 'cute', message: 'Spa mode: ON! 🛁✨ Let\'s create the most peaceful day together! 💕' },
    { mood: 'cute', message: 'Bubble baths, candles, and zero worries! 🛁✨ Your perfect spa day awaits! 💝' },
    { mood: 'cute', message: 'Time to press pause on everything and just breathe! 🛁💕 Your spa day is ready! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Spa day activated! 🛁🎉 Leave your worries at the door and let\'s get pampered! ✨' },
    { mood: 'fun', message: 'Stress? Never heard of it! 🛁✨ Today is all about maximum relaxation! 🎊' },
    { mood: 'fun', message: 'Warning: Extreme chill vibes ahead! 🛁💆‍♀️ Prepare for the ultimate spa experience! 🎉' },
    { mood: 'fun', message: 'Spa day = best day! 🛁✨ Let\'s turn this into the most relaxing day ever! 🎊' },
    { mood: 'fun', message: 'Time to spa like there\'s no tomorrow! 🛁💕 Get ready for pure bliss! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'You work so hard. Today, let me take care of everything so you can truly rest 🛁💝' },
    { mood: 'heartfelt', message: 'A day of peace and tranquility, just for you. You deserve this moment of calm 🛁💕' },
    { mood: 'heartfelt', message: 'Let\'s slow down together and create a space of pure relaxation and care 🛁💖' },
    { mood: 'heartfelt', message: 'This is my gift to you: a day where you don\'t have to do anything but be yourself 🛁💝' },
    { mood: 'heartfelt', message: 'Time to recharge and reconnect with yourself. I\'ll be here to make sure you have everything you need 🛁💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with the ultimate spa day! 🛁🎉 You deserve this moment of pure luxury! ✨' },
    { mood: 'event', message: 'Special occasion = special treatment! 🛁✨ Let\'s make this spa day unforgettable! 🎊' },
    { mood: 'event', message: 'A day of celebration and relaxation! 🛁🎉 Time to pamper yourself in style! 💕' },
    { mood: 'event', message: 'Marking this special moment with the perfect spa experience! 🛁✨ Enjoy! 🎈' },
    { mood: 'event', message: 'This calls for the ultimate spa day! 🛁🎉 Let\'s celebrate with pure bliss! ✨' },
  ],

  'romantic-dinner': [
    // Cute (5)
    { mood: 'cute', message: 'A romantic dinner just for us! 🍷🍝✨ Candles, good food, and even better company! 💕' },
    { mood: 'cute', message: 'Dinner date night is set! 🍷🍝 Let\'s make this evening extra special together! 💝' },
    { mood: 'cute', message: 'Romantic vibes activated! 🍷🍝✨ Time for a cozy dinner with my favorite person! 💕' },
    { mood: 'cute', message: 'Fine dining, great wine, and you! 🍷🍝✨ The perfect recipe for a perfect night! 💝' },
    { mood: 'cute', message: 'Dinner is served with a side of romance! 🍷🍝💕 Let\'s make tonight magical! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Romantic dinner mode: ACTIVATED! 🍷🍝🎉 Get ready for the best date night ever! ✨' },
    { mood: 'fun', message: 'Fancy dinner, fancy vibes! 🍷🍝✨ Let\'s turn this into an unforgettable night! 🎊' },
    { mood: 'fun', message: 'Dinner date extravaganza! 🍷🍝🎉 Time to wine, dine, and have the best time! 💕' },
    { mood: 'fun', message: 'Warning: Extreme romance ahead! 🍷🍝✨ Prepare for the most amazing dinner date! 🎉' },
    { mood: 'fun', message: 'Dinner, drinks, and all the good vibes! 🍷🍝🎊 Let\'s make this night legendary! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'A quiet dinner together, just us. Because these moments are what I treasure most 🍷🍝💝' },
    { mood: 'heartfelt', message: 'Let\'s slow down and savor this evening together. Good food, great conversation, and you 🍷🍝💕' },
    { mood: 'heartfelt', message: 'Tonight is about us. A romantic dinner to celebrate what we have together 🍷🍝💖' },
    { mood: 'heartfelt', message: 'The best meals are shared with the people we love. Tonight, it\'s just you and me 🍷🍝💝' },
    { mood: 'heartfelt', message: 'Let\'s create another beautiful memory over dinner. Just us, good food, and endless love 🍷🍝💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a romantic dinner! 🍷🍝🎉 Tonight is all about us! ✨' },
    { mood: 'event', message: 'Special occasion calls for a special dinner! 🍷🍝✨ Let\'s celebrate in style! 🎊' },
    { mood: 'event', message: 'A romantic dinner to mark this special moment! 🍷🍝🎉 Here\'s to us! 💕' },
    { mood: 'event', message: 'This deserves the perfect romantic dinner! 🍷🍝✨ Let\'s make it unforgettable! 🎈' },
    { mood: 'event', message: 'Celebrating with fine dining and great company! 🍷🍝🎉 Tonight will be magical! ✨' },
  ],

  'cook-for-you': [
    // Cute (5)
    { mood: 'cute', message: 'Your personal chef is ready! 👩‍🍳✨ Just tell me what you\'re craving and I\'ll make it! 💕' },
    { mood: 'cute', message: 'Kitchen takeover mode: ON! 👩‍🍳✨ Today, I\'m cooking everything you want! 😋' },
    { mood: 'cute', message: 'Menu: Whatever you desire! 👩‍🍳💕 Your wish is my command in the kitchen! ✨' },
    { mood: 'cute', message: 'Time to spoil you with homemade goodness! 👩‍🍳💝 Tell me what sounds delicious!' },
    { mood: 'cute', message: 'Chef mode activated! 👩‍🍳✨ Ready to whip up your favorite meals! 💕' },
    
    // Fun (5)
    { mood: 'fun', message: 'Private chef service, coming right up! 👩‍🍳🎉 What\'s on the menu? Your choice! ✨' },
    { mood: 'fun', message: 'Kitchen adventures await! 👩‍🍳🎊 Tell me what you want and watch the magic happen! 😋' },
    { mood: 'fun', message: 'Chef {senderName} at your service! 👩‍🍳✨ Today, I cook, you enjoy! 🎉' },
    { mood: 'fun', message: 'Warning: Deliciousness overload ahead! 👩‍🍳🎊 What should we make first? ✨' },
    { mood: 'fun', message: 'Cooking marathon mode: ACTIVATED! 👩‍🍳🎉 Your kitchen, your rules, my cooking! 💕' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'Let me cook for you today. Because taking care of you brings me so much joy 👩‍🍳💝' },
    { mood: 'heartfelt', message: 'There\'s something special about preparing a meal for someone you love. Today, it\'s all for you 👩‍🍳💕' },
    { mood: 'heartfelt', message: 'Tell me what you\'d like, and I\'ll make it with all the love I have 👩‍🍳💖' },
    { mood: 'heartfelt', message: 'Cooking for you is my way of showing how much I care. What would make you happy today? 👩‍🍳💝' },
    { mood: 'heartfelt', message: 'Let\'s create something delicious together. Your comfort and happiness are my priority 👩‍🍳💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a private chef experience! 👩‍🍳🎉 What would you like to feast on? ✨' },
    { mood: 'event', message: 'Special occasion = special menu! 👩‍🍳✨ Tell me your dream meal and I\'ll make it! 🎊' },
    { mood: 'event', message: 'A culinary celebration just for you! 👩‍🍳🎉 Your personal chef is ready! 💕' },
    { mood: 'event', message: 'Marking this moment with the perfect meal! 👩‍🍳✨ What sounds amazing to you? 🎈' },
    { mood: 'event', message: 'This calls for chef-level cooking! 👩‍🍳🎉 Let\'s make something incredible! ✨' },
  ],

  'one-free-wish': [
    // Cute (5)
    { mood: 'cute', message: 'One wish, coming right up! 🌟✨ What would make you the happiest? 💕' },
    { mood: 'cute', message: 'Your wish is my command! 🌟💝 Tell me what you\'ve been dreaming of! ✨' },
    { mood: 'cute', message: 'Magic time! 🌟✨ One special wish, just for you! What will it be? 💕' },
    { mood: 'cute', message: 'Wish granted! 🌟💝 What would make your heart smile today? ✨' },
    { mood: 'cute', message: 'One free wish, no questions asked! 🌟💕 What\'s your heart\'s desire? ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Wish mode: ACTIVATED! 🌟🎉 What would make today absolutely amazing? ✨' },
    { mood: 'fun', message: 'One wish, unlimited possibilities! 🌟🎊 What\'s on your wish list? 💕' },
    { mood: 'fun', message: 'Warning: Wish-granting powers activated! 🌟🎉 What would you like? ✨' },
    { mood: 'fun', message: 'Your genie is here! 🌟🎊 One wish, make it count! What do you want? 💕' },
    { mood: 'fun', message: 'Wish time! 🌟🎉 Think big, dream bigger! What would make you smile? ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'Tell me what would bring you joy, and I\'ll do everything in my power to make it happen 🌟💝' },
    { mood: 'heartfelt', message: 'Your happiness means everything to me. What is one thing that would make you smile? 🌟💕' },
    { mood: 'heartfelt', message: 'This is my promise to you: one wish, from my heart to yours. What would make you happy? 🌟💖' },
    { mood: 'heartfelt', message: 'Let me make one of your dreams come true. What would bring you the most joy? 🌟💝' },
    { mood: 'heartfelt', message: 'Because you deserve the world, here\'s one wish I can grant. What would make your day? 🌟💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a wish granted! 🌟🎉 What would make this occasion perfect? ✨' },
    { mood: 'event', message: 'Special occasion = special wish! 🌟✨ What would make this moment unforgettable? 🎊' },
    { mood: 'event', message: 'A wish to mark this celebration! 🌟🎉 What would bring you the most joy? 💕' },
    { mood: 'event', message: 'This calls for a wish come true! 🌟✨ What would make this day perfect? 🎈' },
    { mood: 'event', message: 'Celebrating with one magical wish! 🌟🎉 What would you like? ✨' },
  ],

  'movie-night': [
    // Cute (5)
    { mood: 'cute', message: 'Movie night, all set up! 🎬🍿✨ Pick the movie and I\'ll handle the rest! 💕' },
    { mood: 'cute', message: 'Cozy movie night incoming! 🎬🍿💝 Snacks, blankets, and you! ✨' },
    { mood: 'cute', message: 'The perfect theater night awaits! 🎬🍿✨ Your choice of movie, my treat! 💕' },
    { mood: 'cute', message: 'Movie date night is ready! 🎬🍿💝 Let\'s get cozy and watch something amazing! ✨' },
    { mood: 'cute', message: 'Cinema vibes at home! 🎬🍿💕 Pick your favorite and let\'s enjoy together! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Movie night extravaganza! 🎬🍿🎉 What are we watching? You choose! ✨' },
    { mood: 'fun', message: 'Theater night mode: ACTIVATED! 🎬🍿🎊 Get ready for the ultimate movie experience! 💕' },
    { mood: 'fun', message: 'Movie marathon approved! 🎬🍿🎉 Pick the film and let\'s make it legendary! ✨' },
    { mood: 'fun', message: 'Warning: Extreme coziness ahead! 🎬🍿🎉 Movie night is on! What\'s playing? 💕' },
    { mood: 'fun', message: 'Cinema experience, coming right up! 🎬🍿🎊 Your movie, your rules! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'Let\'s spend the evening together, just us and a good movie. These quiet moments are everything 🎬🍿💝' },
    { mood: 'heartfelt', message: 'A cozy night in, watching something we love together. Perfect simplicity 🎬🍿💕' },
    { mood: 'heartfelt', message: 'The best nights are the simple ones: you, me, and a great movie 🎬🍿💖' },
    { mood: 'heartfelt', message: 'Let\'s slow down and enjoy this evening together. Pick something you love, and I\'ll be right here 🎬🍿💝' },
    { mood: 'heartfelt', message: 'Tonight is about us, unwinding together with a movie. What would you like to watch? 🎬🍿💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with the perfect movie night! 🎬🍿🎉 What should we watch? ✨' },
    { mood: 'event', message: 'Special occasion = special movie night! 🎬🍿✨ Let\'s make it unforgettable! 🎊' },
    { mood: 'event', message: 'A movie night to mark this celebration! 🎬🍿🎉 Your pick, my treat! 💕' },
    { mood: 'event', message: 'This calls for the ultimate movie experience! 🎬🍿✨ What\'s on the playlist? 🎈' },
    { mood: 'event', message: 'Celebrating with cinema vibes! 🎬🍿🎉 Let\'s watch something amazing! ✨' },
  ],

  'forgive-mistake': [
    // Cute (5)
    { mood: 'cute', message: 'All is forgiven, no questions asked! 💖✨ Let\'s move forward together! 💕' },
    { mood: 'cute', message: 'Fresh start, clean slate! 💖💝 Here\'s to new beginnings! ✨' },
    { mood: 'cute', message: 'Forgiveness granted! 💖✨ Let\'s leave the past behind and focus on us! 💕' },
    { mood: 'cute', message: 'One mistake, forgiven and forgotten! 💖💝 What matters is we\'re together! ✨' },
    { mood: 'cute', message: 'Instant forgiveness, just for you! 💖💕 Let\'s start fresh! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Mistake? What mistake? 💖🎉 All good, let\'s keep moving forward! ✨' },
    { mood: 'fun', message: 'Forgiveness mode: ACTIVATED! 💖🎊 Clean slate, here we go! 💕' },
    { mood: 'fun', message: 'One free pass, no questions asked! 💖🎉 Let\'s turn the page! ✨' },
    { mood: 'fun', message: 'Warning: Extreme forgiveness ahead! 💖🎊 All is well! 💕' },
    { mood: 'fun', message: 'Mistake deleted from memory! 💖🎉 Fresh start, here we come! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'We all make mistakes. What matters is that we learn and grow together. I forgive you 💖💝' },
    { mood: 'heartfelt', message: 'Let\'s move past this and focus on what we have. Our bond is stronger than any mistake 💖💕' },
    { mood: 'heartfelt', message: 'Forgiveness is a gift I give freely because you mean everything to me 💖💖' },
    { mood: 'heartfelt', message: 'One mistake doesn\'t define us. Let\'s start fresh and continue building something beautiful 💖💝' },
    { mood: 'heartfelt', message: 'I choose to forgive because our relationship is worth more than holding onto the past 💖💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating a fresh start! 💖🎉 All is forgiven, here\'s to new beginnings! ✨' },
    { mood: 'event', message: 'Special occasion = special forgiveness! 💖✨ Let\'s mark this moment with a clean slate! 🎊' },
    { mood: 'event', message: 'A new beginning to celebrate! 💖🎉 Forgiveness granted, let\'s move forward! 💕' },
    { mood: 'event', message: 'This calls for a fresh start! 💖✨ All is well, here\'s to us! 🎈' },
    { mood: 'event', message: 'Celebrating with forgiveness and new beginnings! 💖🎉 Let\'s make it count! ✨' },
  ],

  'write-letter': [
    // Cute (5)
    { mood: 'cute', message: 'A handwritten letter, just for you! ✍️💌 1000+ words of love and thoughts! 💕' },
    { mood: 'cute', message: 'Time to put pen to paper and write you something special! ✍️💝 Get ready for lots of words! ✨' },
    { mood: 'cute', message: 'A letter full of everything I want to say! ✍️💌 Handwritten with love! 💕' },
    { mood: 'cute', message: '1000+ words of pure love, coming your way! ✍️💝 This letter is going to be amazing! ✨' },
    { mood: 'cute', message: 'Handwritten thoughts and feelings, just for you! ✍️💌 Get ready for a long, heartfelt letter! 💕' },
    
    // Fun (5)
    { mood: 'fun', message: 'Letter-writing mode: ACTIVATED! ✍️🎉 Get ready for 1000+ words of awesomeness! ✨' },
    { mood: 'fun', message: 'Warning: Extreme wordiness ahead! ✍️🎊 1000+ words of pure love incoming! 💕' },
    { mood: 'fun', message: 'Time to write you the longest, most amazing letter ever! ✍️🎉 1000+ words, here we go! ✨' },
    { mood: 'fun', message: 'Letter extravaganza! ✍️🎊 Handwritten, heartfelt, and 1000+ words long! 💕' },
    { mood: 'fun', message: 'Get ready for a letter marathon! ✍️🎉 1000+ words of everything I want to tell you! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'Sometimes words on paper can say what spoken words cannot. This letter is my heart, written for you ✍️💝' },
    { mood: 'heartfelt', message: '1000+ words to express everything I feel but struggle to say. This letter is my love, in writing ✍️💕' },
    { mood: 'heartfelt', message: 'Let me take the time to write you something meaningful. Every word will be chosen with care ✍️💖' },
    { mood: 'heartfelt', message: 'A handwritten letter, because you deserve something tangible that shows how much you mean to me ✍️💝' },
    { mood: 'heartfelt', message: 'This letter will contain 1000+ words of everything I want you to know. Written with love, just for you ✍️💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a handwritten letter! ✍️🎉 1000+ words of love and celebration! ✨' },
    { mood: 'event', message: 'Special occasion = special letter! ✍️✨ 1000+ words to mark this moment! 🎊' },
    { mood: 'event', message: 'A letter to celebrate this special time! ✍️🎉 Handwritten with all my love! 💕' },
    { mood: 'event', message: 'This calls for a heartfelt letter! ✍️✨ 1000+ words of celebration and love! 🎈' },
    { mood: 'event', message: 'Celebrating with words from the heart! ✍️🎉 Get ready for an amazing letter! ✨' },
  ],

  'buy-me-this': [
    // Cute (5)
    { mood: 'cute', message: 'That thing you\'ve been eyeing? It\'s yours! 🎁✨ No questions asked! 💕' },
    { mood: 'cute', message: 'Your wish list item, coming right up! 🎁💝 Tell me what you want and it\'s yours! ✨' },
    { mood: 'cute', message: 'Time to treat yourself! 🎁💕 That special something you\'ve been wanting? It\'s yours! ✨' },
    { mood: 'cute', message: 'One thoughtful gift, just for you! 🎁💝 What would make you smile? ✨' },
    { mood: 'cute', message: 'Your dream gift awaits! 🎁💕 Tell me what you\'ve been dreaming of! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Gift mode: ACTIVATED! 🎁🎉 What\'s on your wish list? It\'s yours! ✨' },
    { mood: 'fun', message: 'Warning: Extreme generosity ahead! 🎁🎊 What would make you happy? 💕' },
    { mood: 'fun', message: 'Shopping spree approved! 🎁🎉 That thing you want? Consider it done! ✨' },
    { mood: 'fun', message: 'Gift extravaganza! 🎁🎊 Tell me what you\'ve been eyeing and watch it appear! 💕' },
    { mood: 'fun', message: 'One wish, one gift, unlimited happiness! 🎁🎉 What would you like? ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'I want to give you something that brings you joy. What is that one thing you\'ve been wanting? 🎁💝' },
    { mood: 'heartfelt', message: 'Seeing you happy makes me happy. Tell me what would bring a smile to your face, and it\'s yours 🎁💕' },
    { mood: 'heartfelt', message: 'This is my way of showing you how much I care. What would make your day? 🎁💖' },
    { mood: 'heartfelt', message: 'You deserve something special. What is that thoughtful gift you\'ve been dreaming of? 🎁💝' },
    { mood: 'heartfelt', message: 'Let me give you something meaningful. What would bring you the most joy right now? 🎁💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a thoughtful gift! 🎁🎉 What would make this occasion perfect? ✨' },
    { mood: 'event', message: 'Special occasion = special gift! 🎁✨ What\'s on your wish list? 🎊' },
    { mood: 'event', message: 'A gift to mark this celebration! 🎁🎉 Tell me what would make you happy! 💕' },
    { mood: 'event', message: 'This calls for the perfect gift! 🎁✨ What would you love to receive? 🎈' },
    { mood: 'event', message: 'Celebrating with something special! 🎁🎉 What would make this moment unforgettable? ✨' },
  ],

  'pack-lunchbox': [
    // Cute (5)
    { mood: 'cute', message: 'A homemade lunch surprise, just for you! 🥪🎥✨ Made with love and a little video! 💕' },
    { mood: 'cute', message: 'Lunchbox packed with care! 🥪💝 Plus a video showing how I made it! ✨' },
    { mood: 'cute', message: 'Your favorite lunch, homemade and ready! 🥪🎥💕 Watch the making process! ✨' },
    { mood: 'cute', message: 'Surprise lunchbox incoming! 🥪💝 Made with love and documented on video! 💕' },
    { mood: 'cute', message: 'A lunch surprise with a side of video! 🥪🎥✨ Made just for you! 💕' },
    
    // Fun (5)
    { mood: 'fun', message: 'Lunchbox surprise mode: ACTIVATED! 🥪🎉 Get ready for homemade goodness + video! ✨' },
    { mood: 'fun', message: 'Warning: Extreme lunchbox awesomeness ahead! 🥪🎊 Homemade + video = perfection! 💕' },
    { mood: 'fun', message: 'Lunch surprise extravaganza! 🥪🎉 Homemade, heartfelt, and video-documented! ✨' },
    { mood: 'fun', message: 'Lunchbox + behind-the-scenes video! 🥪🎊 The perfect combo! 💕' },
    { mood: 'fun', message: 'Get ready for the best lunch ever! 🥪🎉 Homemade with love and a making video! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'I wanted to make you something special. A homemade lunch, made with care, and a video so you can see the process 🥪💝' },
    { mood: 'heartfelt', message: 'Taking the time to prepare something for you brings me joy. Here\'s a lunch made with love, plus a little video 🥪💕' },
    { mood: 'heartfelt', message: 'A homemade lunch, because you deserve something made with care. Watch the video to see how much thought went into it 🥪💖' },
    { mood: 'heartfelt', message: 'This lunchbox is my way of taking care of you. The video shows just how much I wanted to make this special 🥪💝' },
    { mood: 'heartfelt', message: 'Let me prepare something nourishing for you. A homemade lunch, documented so you can see the love that went into it 🥪💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a lunch surprise! 🥪🎉 Homemade with love + making video! ✨' },
    { mood: 'event', message: 'Special occasion = special lunch! 🥪✨ Made with care and documented! 🎊' },
    { mood: 'event', message: 'A lunchbox to mark this celebration! 🥪🎉 Homemade + video = perfect! 💕' },
    { mood: 'event', message: 'This calls for the ultimate lunch surprise! 🥪✨ Made with love and captured on video! 🎈' },
    { mood: 'event', message: 'Celebrating with homemade goodness! 🥪🎉 Lunch + video, just for you! ✨' },
  ],

  'trip-together': [
    // Cute (5)
    { mood: 'cute', message: 'A trip together, just you and me! ✈️💕 You choose the destination, I\'ll handle the rest! ✨' },
    { mood: 'cute', message: 'Adventure time! ✈️💝 Pick where we\'re going and let\'s make memories! ✨' },
    { mood: 'cute', message: 'Travel plans, coming right up! ✈️💕 You decide where, I\'ll take care of everything! ✨' },
    { mood: 'cute', message: 'A trip to remember! ✈️💝 Destination: your choice! Let\'s explore together! ✨' },
    { mood: 'cute', message: 'Pack your bags! ✈️💕 Where would you like to go? I\'ve got everything covered! ✨' },
    
    // Fun (5)
    { mood: 'fun', message: 'Trip mode: ACTIVATED! ✈️🎉 Where are we going? You choose, I plan! ✨' },
    { mood: 'fun', message: 'Adventure extravaganza! ✈️🎊 Pick the destination and let\'s make it legendary! 💕' },
    { mood: 'fun', message: 'Warning: Extreme wanderlust ahead! ✈️🎉 Where should we explore? ✨' },
    { mood: 'fun', message: 'Travel plans approved! ✈️🎊 You pick the place, I\'ll make it happen! 💕' },
    { mood: 'fun', message: 'Get ready for the trip of a lifetime! ✈️🎉 Destination: your choice! ✨' },
    
    // Heartfelt (5)
    { mood: 'heartfelt', message: 'Let\'s create memories together. You choose where we go, and I\'ll make sure everything is taken care of ✈️💝' },
    { mood: 'heartfelt', message: 'A trip together, just us. Because exploring the world with you is one of my greatest joys ✈️💕' },
    { mood: 'heartfelt', message: 'Where would you like to go? Let\'s plan an adventure together and make it unforgettable ✈️💖' },
    { mood: 'heartfelt', message: 'This trip is about us, creating new memories in a place you choose. I\'ll handle all the details ✈️💝' },
    { mood: 'heartfelt', message: 'Let\'s take this journey together. You pick the destination, and I\'ll make sure it\'s everything you\'ve dreamed of ✈️💕' },
    
    // Event (5)
    { mood: 'event', message: 'Celebrating with a trip together! ✈️🎉 Where should we go? You choose! ✨' },
    { mood: 'event', message: 'Special occasion = special destination! ✈️✨ Let\'s plan the perfect trip! 🎊' },
    { mood: 'event', message: 'A trip to mark this celebration! ✈️🎉 Pick the place and let\'s make it amazing! 💕' },
    { mood: 'event', message: 'This calls for an unforgettable journey! ✈️✨ Where would you love to explore? 🎈' },
    { mood: 'event', message: 'Celebrating with travel and adventure! ✈️🎉 Let\'s plan something incredible! ✨' },
  ],
};

// Get a random message template for a given coupon type and mood
export function getRandomMessage(couponType: string, mood: MoodType, recipientName?: string, senderName?: string): string {
  const templates = messageTemplates[couponType];
  if (!templates || templates.length === 0) {
    return 'Let\'s create special moments together! 💝';
  }

  // Filter templates by mood
  const moodTemplates = templates.filter(t => t.mood === mood);
  
  // If no templates for this mood, use any template
  const availableTemplates = moodTemplates.length > 0 ? moodTemplates : templates;
  
  // Pick a random template
  const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
  
  // Format the message with names
  return formatMessage(randomTemplate.message, recipientName, senderName);
}
