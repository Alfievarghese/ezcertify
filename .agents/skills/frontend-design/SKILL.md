---
name: frontend-design
description: >
  Studio-grade frontend design methodology for distinctive, opinionated UI/UX work.
  Use this skill whenever designing or redesigning any frontend page, component, or visual system.
  Covers palette, typography, layout, motion, copy, and self-critique process.
  Triggered by tasks involving UI design, redesign, visual identity, landing pages, component styling, or design system work.
---

# Frontend Design — Studio-Grade Methodology

Approach every design task as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

---

## Ground It in the Subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before — use that as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

---

## Design Principles

### Hero as Thesis
For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer — only use if that's truly the best option.

### Typography Carries Personality
Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content.

### Structure Is Information
Structural devices — numbering, eyebrows, dividers, labels — should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a real process or a typed timeline where order carries information the reader needs. Question if choices like numbered markers actually make sense before incorporating them.

### Leverage Motion Deliberately
Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. However, sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.

### Match Complexity to Vision
Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.

### Content and Copy
Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself. See the Writing in Design section below.

---

## Process: Brainstorm, Explore, Plan, Critique, Build, Critique Again

### Calibration — Avoid AI Defaults
AI-generated design right now clusters around three looks:
1. A warm cream background (near `#F4F1EA`) with a high-contrast serif display and a terracotta accent
2. A near-black background with a single bright acid-green or vermilion accent
3. A broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns

All three are legitimate for some briefs, but they are **defaults rather than choices**, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults.

### Two-Pass Workflow

**Pass 1 — Design Plan:** Brainstorm a short design plan based on the brief. Create a compact token system:

- **Color:** Describe the palette as 4–6 named hex values.
- **Type:** The typefaces for 2+ roles (a characterful display face that's used with restraint, a complementary body face, and a utility face for captions or data if needed).
- **Layout:** A layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare.
- **Signature:** The single unique element this page will be remembered by that embodies the brief in an appropriate way.

**Pass 2 — Self-Critique:** Review that plan against the brief before building. If any part of it reads like the generic default you would produce for any similar page rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan exactly and deriving every color and type decision from it.

### CSS Specificity Warning
When writing code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like `.section` and an element-based selector like `.cta`). This can happen often with paddings/margins between sections.

### Internal Iteration
Do a lot of planning and iteration in your thinking, and only show ideas to the user when you have higher confidence it'll delight them.

---

## Restraint and Self-Critique

- **Spend your boldness in one place.** Let the signature element be the one memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief.
- **Not taking a risk can be a risk itself.**
- **Build to a quality floor without announcing it:** responsive down to mobile, visible keyboard focus, reduced motion respected.
- **Critique your own work as you build**, taking screenshots if your environment supports it — a picture is worth 1000 tokens.
- **Chanel's advice:** before leaving the house, take a look in the mirror and remove one accessory.
- **Memory and novelty:** Human creators have memory and always try to do something new. If you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

---

## Writing in Design

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color.

### Principles

1. **Write from the end user's side of the screen.** Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.

2. **Use active voice as default.** A control should say exactly what happens when it's used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published."

3. **Vocabulary is signposting.** The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

4. **Failure and emptiness are moments for direction, not mood.** Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

5. **Keep the register conversational and tuned:** plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each element do exactly one job. A label labels, an example demonstrates, and nothing quietly does double duty.

---

## EzCertify-Specific Context

When applying this skill to EzCertify, keep in mind:

- **Product:** Bulk certificate generator with visual canvas editor, Excel data binding, QR verification, and server-side batch rendering.
- **Audience:** Educators, event organizers, HR teams, training coordinators — people who need to issue many certificates quickly and want them to look legitimate and verifiable.
- **Pages:** Landing (upload flow), Editor (canvas workspace), Generate (progress/download), Verify (QR scan result).
- **Tech stack:** React 18, Vite, Tailwind CSS, Framer Motion, Fabric.js, Lucide icons.
- **Current design tokens:** Inter font family, blue-indigo primary palette (`#5c7cfa`–`#364fc7`), neutral surface grays, success/warning/danger semantic colors.
- **The subject's world:** Certificates, seals, stamps, formal documents, ink, parchment, foil, embossing, signatures, credential verification, academic regalia, the weight of official paper in your hands. These are where distinctive choices should come from.
