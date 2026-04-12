import base44 from "../api/base44Client.ts";

export default async function seedOurSpace(req: Request) {
  const db = base44.asServiceRole.entities;

  // Seed Profiles
  const profiles = [
    {
      user_email: "maya.johnson@ourspace.app",
      display_name: "Maya J ✨",
      headline: "Artist | Dreamer | Creator of weird things",
      about_me: "I make digital art, write poetry at 2am, and collect vintage sunglasses. This is my corner of the internet 🎨",
      interests: ["digital art", "poetry", "vintage fashion", "lo-fi music"],
      hobbies: ["painting", "journaling", "thrift shopping"],
      mood: "vibing 🎵",
      song_playing: "Good Days — SZA",
      theme_color: "#9B59B6",
      background_gradient: "purple-pink",
      privacy_level: "public",
      is_online: true,
      profile_views: 1247
    },
    {
      user_email: "carlos.m@ourspace.app",
      display_name: "Carlos M 🔥",
      headline: "Engineer by day, skater by night",
      about_me: "Building things that matter. Skating spots around the city. No algorithm tells me what to watch 🛹",
      interests: ["skateboarding", "tech", "hip-hop", "basketball"],
      hobbies: ["skating", "coding side projects", "making beats"],
      mood: "locked in 💪",
      song_playing: "HUMBLE. — Kendrick Lamar",
      theme_color: "#E67E22",
      background_gradient: "orange-red",
      privacy_level: "public",
      is_online: true,
      profile_views: 893
    },
    {
      user_email: "priya.k@ourspace.app",
      display_name: "Priya K 🌸",
      headline: "Bookworm | Tea enthusiast | Future novelist",
      about_me: "I read 50 books a year and I'm not sorry about it. Currently writing my first novel. Ask me for a recommendation 📚",
      interests: ["reading", "writing", "tea", "hiking", "photography"],
      hobbies: ["writing fiction", "tea tasting", "nature walks"],
      mood: "cozy 🍵",
      song_playing: "Weightless — Marconi Union",
      theme_color: "#27AE60",
      background_gradient: "green-teal",
      privacy_level: "public",
      is_online: false,
      profile_views: 562
    },
    {
      user_email: "zach.t@ourspace.app",
      display_name: "Zach T 🎮",
      headline: "Gamer | Content creator | Dog dad",
      about_me: "Streaming games, living life. My golden retriever Max runs this profile honestly 🐕",
      interests: ["gaming", "streaming", "dogs", "pizza", "anime"],
      hobbies: ["streaming", "dog walking", "cooking"],
      mood: "grinding 🎮",
      song_playing: "Blinding Lights — The Weeknd",
      theme_color: "#2980B9",
      background_gradient: "blue-cyan",
      privacy_level: "public",
      is_online: true,
      profile_views: 2103
    },
    {
      user_email: "aisha.r@ourspace.app",
      display_name: "Aisha R 🌙",
      headline: "Musician | Composer | Night owl",
      about_me: "I produce music at midnight and sleep during the day. Soundcloud linked 🎹",
      interests: ["music production", "piano", "jazz", "photography", "cats"],
      hobbies: ["composing", "recording", "photography"],
      mood: "in the zone 🎹",
      song_playing: "Numb Little Bug — Em Beihold",
      theme_color: "#1ABC9C",
      background_gradient: "teal-blue",
      privacy_level: "public",
      is_online: false,
      profile_views: 734
    }
  ];

  // Seed Posts
  const posts = [
    {
      author_email: "maya.johnson@ourspace.app",
      author_name: "Maya J ✨",
      content: "Just finished this piece after 3 weeks. Sometimes you have to sit with something a long time before it's ready 🎨 No filter, no edits — just the work.",
      image_url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/d6e071a12_generated_image.png",
      post_type: "image",
      likes_count: 247,
      comments_count: 31,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["carlos.m@ourspace.app", "priya.k@ourspace.app", "zach.t@ourspace.app"],
      searchable_text: "digital art painting finished piece"
    },
    {
      author_email: "carlos.m@ourspace.app",
      author_name: "Carlos M 🔥",
      content: "The algorithm never showed you this spot. That's exactly why we built OurSpace. Caught this in the feed of someone I actually follow. Hit different 🛹",
      image_url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/ef7c4b2af_generated_image.png",
      post_type: "image",
      likes_count: 189,
      comments_count: 22,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["maya.johnson@ourspace.app", "aisha.r@ourspace.app"],
      searchable_text: "skateboarding sunset city spot"
    },
    {
      author_email: "priya.k@ourspace.app",
      author_name: "Priya K 🌸",
      content: "Current reading setup. Chapter 12 of my novel is finally clicking. Three years of writing, and this scene just wrote itself in 20 minutes. That's why you keep going 📚☕",
      image_url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/8312a8cab_generated_image.png",
      post_type: "image",
      likes_count: 312,
      comments_count: 45,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["maya.johnson@ourspace.app", "carlos.m@ourspace.app", "aisha.r@ourspace.app", "zach.t@ourspace.app"],
      searchable_text: "reading books writing novel tea cozy"
    },
    {
      author_email: "zach.t@ourspace.app",
      author_name: "Zach T 🎮",
      content: "Max has decided my streaming setup is his bed now. Guess we're co-streaming. Game: Elden Ring. Guest: Max. Rating: 10/10 🐕🎮",
      post_type: "text",
      likes_count: 428,
      comments_count: 67,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["maya.johnson@ourspace.app", "priya.k@ourspace.app"],
      searchable_text: "gaming streaming dog golden retriever elden ring"
    },
    {
      author_email: "aisha.r@ourspace.app",
      author_name: "Aisha R 🌙",
      content: "New beat dropped at 2am like always. Posting here first because I know the algorithm would bury this on other platforms. You found it — that means something 🎹✨",
      post_type: "text",
      likes_count: 156,
      comments_count: 19,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["maya.johnson@ourspace.app", "carlos.m@ourspace.app"],
      searchable_text: "music beat production jazz piano"
    },
    {
      author_email: "carlos.m@ourspace.app",
      author_name: "Carlos M 🔥",
      content: "OurSpace just feels different. My last post on Instagram got 12 likes. Posted the same thing here and 189 people actually SAW it. Chronological feeds are not a feature — they're a right 🙌",
      post_type: "text",
      likes_count: 534,
      comments_count: 88,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["priya.k@ourspace.app", "aisha.r@ourspace.app", "zach.t@ourspace.app"],
      searchable_text: "ourspace chronological feed algorithm"
    },
    {
      author_email: "priya.k@ourspace.app",
      author_name: "Priya K 🌸",
      content: "Hot take: The best social network is the one where you control what you see. I turned on the Human-Only Filter yesterday and my feed felt like 2012 again. Real people posting real things. Revolutionary.",
      post_type: "text",
      likes_count: 267,
      comments_count: 52,
      is_ai_generated: false,
      is_unfiltered: true,
      liked_by: ["maya.johnson@ourspace.app", "carlos.m@ourspace.app"],
      searchable_text: "human only filter social media real people"
    }
  ];

  // Seed Friends
  const friends = [
    { requester_email: "maya.johnson@ourspace.app", receiver_email: "carlos.m@ourspace.app", status: "accepted", requester_name: "Maya J ✨", receiver_name: "Carlos M 🔥" },
    { requester_email: "maya.johnson@ourspace.app", receiver_email: "priya.k@ourspace.app", status: "accepted", requester_name: "Maya J ✨", receiver_name: "Priya K 🌸" },
    { requester_email: "carlos.m@ourspace.app", receiver_email: "zach.t@ourspace.app", status: "accepted", requester_name: "Carlos M 🔥", receiver_name: "Zach T 🎮" },
    { requester_email: "priya.k@ourspace.app", receiver_email: "aisha.r@ourspace.app", status: "accepted", requester_name: "Priya K 🌸", receiver_name: "Aisha R 🌙" },
    { requester_email: "aisha.r@ourspace.app", receiver_email: "maya.johnson@ourspace.app", status: "accepted", requester_name: "Aisha R 🌙", receiver_name: "Maya J ✨" },
  ];

  // Seed Wall Posts
  const wallPosts = [
    { profile_email: "maya.johnson@ourspace.app", author_email: "carlos.m@ourspace.app", author_name: "Carlos M 🔥", content: "Your new piece is 🔥🔥🔥 how long did that take?" },
    { profile_email: "carlos.m@ourspace.app", author_email: "maya.johnson@ourspace.app", author_name: "Maya J ✨", content: "That skate clip was INSANE. You need to drop a Reel of this asap" },
    { profile_email: "priya.k@ourspace.app", author_email: "aisha.r@ourspace.app", author_name: "Aisha R 🌙", content: "Can't wait to read your novel when it's done!! What genre is it?" },
    { profile_email: "aisha.r@ourspace.app", author_email: "priya.k@ourspace.app", author_name: "Priya K 🌸", content: "That 2am beat goes HARD. Put me on the listening list 🙏" },
  ];

  // Seed Notifications
  const notifications = [
    { user_email: "maya.johnson@ourspace.app", from_email: "carlos.m@ourspace.app", from_name: "Carlos M 🔥", type: "like", message: "Carlos M liked your post", is_read: false },
    { user_email: "maya.johnson@ourspace.app", from_email: "priya.k@ourspace.app", from_name: "Priya K 🌸", type: "comment", message: "Priya K commented on your post", is_read: false },
    { user_email: "carlos.m@ourspace.app", from_email: "maya.johnson@ourspace.app", from_name: "Maya J ✨", type: "wall_post", message: "Maya J left a message on your wall", is_read: true },
    { user_email: "aisha.r@ourspace.app", from_email: "priya.k@ourspace.app", from_name: "Priya K 🌸", type: "friend_request", message: "Priya K wants to be your friend", is_read: false },
  ];

  try {
    const [p, po, f, w, n] = await Promise.all([
      db.Profile.bulkCreate(profiles),
      db.Post.bulkCreate(posts),
      db.Friend.bulkCreate(friends),
      db.WallPost.bulkCreate(wallPosts),
      db.Notification.bulkCreate(notifications),
    ]);

    return new Response(JSON.stringify({
      success: true,
      seeded: {
        profiles: profiles.length,
        posts: posts.length,
        friends: friends.length,
        wallPosts: wallPosts.length,
        notifications: notifications.length
      }
    }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
