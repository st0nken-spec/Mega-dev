# Foundation roadmap

## M0 - Product brief and device decisions

Exit when:
- the family learning-hub brief in `PRODUCT.md` is accepted;
- the first child, learning goal and game are chosen;
- target family phone/tablet/browser devices are listed;
- child-data retention and parent controls are agreed;
- PWA-first versus immediate Expo/native is decided in an ADR.

## M1 - Play hub walking skeleton

Build one child profile, one parent-selected learning track and one touch-friendly matching game. Exit when it runs as an installable PWA on Ivan's phone and one family device, works in a desktop browser, stores one progress record and passes local/CI checks with no real child data.

## M2 - Self-hosted private alpha

Run the PWA and Supabase/PostgreSQL from versioned Docker Compose on Ivan's always-on home machine. Exit when Tailscale HTTPS works away from home Wi-Fi, family access is narrow, backups exist, one restore is proven, and deploy/rollback/lost-device steps are documented.

## M3 - Useful play hub

Add Snake and tic-tac-toe learning modes plus curated math, Swedish, English and general-knowledge packs. Exit when games remain fun in child testing, difficulty is parent-adjustable, spoken/visual prompts meet the chosen age level, and progress collection is minimal and useful.

## M4 - Create hub

Add coloring pages, free drawing and contour tracing. Exit when touch/stylus drawing performs well on target devices, artwork storage/export follows the parent's choice, and child work remains private to the household.

## M5 - Homework hub

Add parent-configured practice generation. Start with templates and curated content; gate any AI generation behind parent review and a child-data privacy decision. Exit when generated work is age-appropriate, editable, printable/on-screen and never shown to a child before parent approval.

## M6 - Dependable family release

Exit when core play/create flows work without developer intervention, accessibility and recovery meet the agreed target, lost-device revocation is tested, and the PWA/native decision is revisited from real usage.
