import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) {
    return NextResponse.json({ error: "Service role key missing!" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testUsers = [
    { email: "raja@gmail.com", name: "Raja", role: "Safety Officer" },
    { email: "vishal@gmail.com", name: "Vishal", role: "Fleet Manager" },
    { email: "shruthika@gmail.com", name: "Shruthika", role: "Dispatcher" },
    { email: "sahil@gmail.com", name: "Sahil", role: "Financial Analyst" },
  ];

  const results = [];

  for (const user of testUsers) {
    console.log(`Setting up user: ${user.email}`);
    
    // 1. Create or Get Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: "1234",
      email_confirm: true,
      user_metadata: { full_name: user.name, role: user.role }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        // User exists, updating password
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData?.users.find(u => u.email === user.email);
        
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: "1234" }
          );
          if (updateError) {
            results.push({ email: user.email, status: "error", message: `Auth update failed: ${updateError.message}` });
            continue;
          }
          
          // Upsert Profile
          const { error: profileError } = await supabase.from("users").upsert({
            id: existingUser.id,
            email: user.email,
            full_name: user.name,
            role: user.role
          });
          
          if (profileError) {
            results.push({ email: user.email, status: "error", message: `Profile upsert failed: ${profileError.message}` });
          } else {
            results.push({ email: user.email, status: "success", message: "Updated password and profile." });
          }
        }
      } else {
        results.push({ email: user.email, status: "error", message: `Auth creation failed: ${authError.message}` });
      }
    } else if (authData.user) {
      // 2. Create Profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: user.email,
        full_name: user.name,
        role: user.role
      });

      if (profileError) {
        results.push({ email: user.email, status: "error", message: `Profile creation failed: ${profileError.message}` });
      } else {
        results.push({ email: user.email, status: "success", message: "Created user and profile." });
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
