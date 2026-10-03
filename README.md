# Tadhana's Handicrafts 🌷

The shop website has a **customer side** and an **admin side**.

**Customer side** (no prices are shown anywhere):
- **Home:** ready-made bouquets with category filters. "Add to order" puts a bouquet in the customer's order.
- **Build your own** (`#/customize`): every flower and filler is listed. Customers pick a color, add as many as they want with **+ / −**, and choose a wrap, extras and a card message.
- **Place order → Receipt** (`#/receipt`): a receipt that lists everything they picked.
  - **Phones:** **Share receipt to Messenger** opens the phone's share menu with the receipt picture attached.
  - **Laptops:** they save the image (or copy the text) and send it to the shop's Facebook page.
  - The shop then replies with the price.
  - Phone sharing needs the site on **https** (Netlify/Vercel give you this). On a plain `http://` link, phones get a "press and hold the picture to save it" screen instead.

**Admin side** (`#/admin`): the owner signs in and manages Flowers, Fillers, Wraps, Extras, Bouquets and Shop info. She can add, edit, delete and reorder items, and use the **In stock / Out of stock** switch to hide something without deleting it. Changes show on the site right away.

---

## Running it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files go to dist/
```
Without Supabase, the site runs in **test mode**:
- The admin page (`#/admin`, also linked in the footer) works with no login.
- Changes are saved only in that browser, which is good for trying things out. Customers on other devices won't see them.
- **Reset test data** puts back the sample flowers.

## Setting up the admin (Supabase, free)
1. Create a project at https://supabase.com.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` and click **Run**. This creates the tables, the photo storage, the security rules and the starter data.
3. **Authentication → Users → Add user**: create the owner's email and password. Turn on **Auto Confirm User**.
4. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up", so nobody else can create an account.
5. **Project Settings → API**: copy the Project URL and the `anon` public key. Then copy `.env.example` to `.env` and paste them in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
6. Restart `npm run dev` and open `http://localhost:5173/#/admin`.

Security: anyone can **read** the shop data, but only a signed-in user can change it. Because sign-ups are off, that's only the owner.

## Putting it online (free)
- **Netlify** or **Vercel**: import the GitHub repo. The build command is `npm run build` and the output folder is `dist`.
- Add the two `VITE_SUPABASE_...` values as **environment variables** in the hosting dashboard (`.env` is not uploaded).
- The admin page is at `https://your-site/#/admin`. It isn't linked anywhere on the site, so bookmark it.
