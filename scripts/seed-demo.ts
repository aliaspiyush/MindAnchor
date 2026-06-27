import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// NOTE: Run this with the service role key to bypass RLS.
// Use tsx: npx tsx scripts/seed-demo.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting MindAnchor seed process...");

  // 1. You need a valid auth.users ID.
  // In a real hackathon demo, you'd sign up a user first in the UI, grab their ID,
  // and paste it here, OR you can create a user directly via Admin API.
  
  const demoEmail = `arjun.sharma.demo.${Date.now()}@example.com`;
  console.log(`Creating demo auth user: ${demoEmail}`);
  
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: demoEmail,
    password: "password123",
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    console.error("Failed to create auth user:", authError);
    return;
  }
  
  const userId = authUser.user.id;
  console.log(`User created. ID: ${userId}`);

  // 2. Update the profile (which was auto-created by the SQL trigger)
  console.log("Updating profile for Arjun...");
  
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 45); // 45 days from now

  await supabase
    .from("profiles")
    .update({
      full_name: "Arjun Sharma",
      exam_type: "NEET",
      exam_date: examDate.toISOString().split("T")[0],
      study_intensity: "intense",
      weak_subjects: ["Organic Chemistry", "Physiology"],
      streak_count: 14,
    })
    .eq("id", userId);

  // 3. Insert 14 days of journal entries and analyses (simulating an arc)
  console.log("Inserting 14 days of journal data...");

  // Arc: Days 1-6 (stable), Days 7-9 (stress spike/burnout), Days 10-14 (recovery)
  const arcData = [
    { mood: 7, stress: 5, burnout: "low", text: "Studied physics today. Went okay. Need to review mechanics.", trig: ["mechanics"], conf: 6 },
    { mood: 7, stress: 4, burnout: "low", text: "Good mock test score. Feeling decent about bio.", trig: [], conf: 7 },
    { mood: 6, stress: 6, burnout: "low", text: "A bit tired today. Too many formulas to remember.", trig: ["formulas"], conf: 6 },
    { mood: 6, stress: 5, burnout: "low", text: "Normal day. 6 hours of study.", trig: [], conf: 6 },
    { mood: 5, stress: 7, burnout: "moderate", text: "Organic chemistry is killing me. I keep forgetting the reactions.", trig: ["Organic Chemistry"], conf: 5 },
    { mood: 4, stress: 7, burnout: "moderate", text: "Didn't sleep well. Woke up panicking about the syllabus left.", trig: ["syllabus", "sleep"], conf: 4 },
    { mood: 3, stress: 9, burnout: "high", text: "I can't do this anymore. My mock scores are dropping. I feel completely overwhelmed and I just want to sleep for a week. What if I fail?", trig: ["mock scores", "fear of failure"], conf: 3 },
    { mood: 2, stress: 10, burnout: "critical", text: "Cried during my study session. Everything looks like a blur. Organic chemistry makes no sense. I'm letting my parents down.", trig: ["Organic Chemistry", "parents expectations"], conf: 2 },
    { mood: 3, stress: 9, burnout: "high", text: "Took a half day off but I just felt guilty the whole time.", trig: ["guilt"], conf: 3 },
    { mood: 5, stress: 7, burnout: "moderate", text: "Talked to my friend. Realized everyone is struggling. Used the breathing tool on the app, it helped a bit.", trig: [], conf: 4 },
    { mood: 6, stress: 6, burnout: "moderate", text: "Back to studying. Taking it slow. Just focusing on one chapter today.", trig: [], conf: 5 },
    { mood: 7, stress: 5, burnout: "low", text: "Finished the chapter. Actually understood the mechanism!", trig: [], conf: 6 },
    { mood: 7, stress: 4, burnout: "low", text: "Good day. Kept my breaks strict. Feeling more in control.", trig: [], conf: 7 },
    { mood: 8, stress: 5, burnout: "low", text: "Did a full mock test. Didn't panic when I saw a tough question. Feeling ready to tackle the next 45 days.", trig: ["tough questions"], conf: 7 },
  ];

  for (let i = 0; i < 14; i++) {
    const d = arcData[i];
    const date = new Date();
    date.setDate(date.getDate() - (13 - i)); // -13 days ago up to today

    const { data: entry } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        entry_text: d.text,
        created_at: date.toISOString(),
      })
      .select("id")
      .single();

    if (entry) {
      await supabase
        .from("entry_analyses")
        .insert({
          entry_id: entry.id,
          user_id: userId,
          mood_score: d.mood,
          stress_score: d.stress,
          confidence_score: d.conf,
          burnout_risk: d.burnout,
          dominant_emotion: d.stress > 7 ? "Anxious" : (d.mood > 6 ? "Hopeful" : "Tired"),
          stress_triggers: d.trig,
          cognitive_patterns: d.stress > 8 ? ["Catastrophizing"] : [],
          support_priority: d.burnout === "critical" ? "urgent" : (d.burnout === "high" ? "active" : "gentle"),
          gemini_insight: `You expressed feelings of ${d.stress > 7 ? 'anxiety' : 'focus'}. ${d.stress > 7 ? 'Remember to take things one step at a time.' : 'Keep up this balanced approach.'}`,
          created_at: date.toISOString(),
        });
    }
  }

  // 4. Insert Chat Sessions
  console.log("Inserting AI chat sessions...");
  
  await supabase.from("chat_sessions").insert({
    user_id: userId,
    session_date: new Date().toISOString().split("T")[0],
    messages: [
      { role: "user", content: "I'm freaking out about organic chemistry.", timestamp: new Date(Date.now() - 600000).toISOString() },
      { role: "assistant", content: "I hear you, Arjun. Organic chemistry is a common stressor, especially with the NEET coming up in 45 days. Let's take a quick moment to ground ourselves before we tackle it.", timestamp: new Date(Date.now() - 500000).toISOString(), function_call: { name: "trigger_breathing_session", args: { duration_minutes: 2 } } },
      { role: "user", content: "Okay, that helped. But I still feel behind.", timestamp: new Date(Date.now() - 400000).toISOString() },
      { role: "assistant", content: "It's completely normal to feel behind when studying intensely. Based on your recent progress, you're actually doing better than you think. How about we look at a specific focus strategy for Organic Chemistry today?", timestamp: new Date(Date.now() - 300000).toISOString(), function_call: { name: "trigger_exam_prep_boost", args: { weak_subjects: ["Organic Chemistry"] } } }
    ]
  });

  console.log("========================================");
  console.log("SEED COMPLETE! Demo user ready.");
  console.log(`Email: ${demoEmail}`);
  console.log(`Password: password123`);
  console.log("========================================");
}

seed();
