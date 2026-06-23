# Art Generation Scripts

Generate all card art from a single manifest. Pick a provider, set an env var, run the script.

## Quick start

```powershell
# 1. Set ONE of these env vars (then restart your terminal)
setx REPLICATE_API_TOKEN "r8_yourtoken..."   # recommended: cheap + fast
# or
setx OPENAI_API_KEY      "sk-yourkey..."     # higher quality, ~$7 for full set
# or
# (no env var) — assumes Automatic1111 SD running on http://127.0.0.1:7860

# 2. Sanity check with one image
pwsh scripts/generate-art.ps1 -Sample 1

# 3. Generate the base set (44 images: 22 ingredients + 15 actions + 7 recipes)
pwsh scripts/generate-art.ps1 -Tier base

# 4. Add the recipe quality variants (24 more)
pwsh scripts/generate-art.ps1 -Tier qualities

# 5. Add the ingredient stage variants (88 more)
pwsh scripts/generate-art.ps1 -Tier stages
```

Skips any file that already exists. Use `-Force` to re-generate.

## Cost estimates

| Provider | Per image | All 167 | Notes |
|---|---|---|---|
| Replicate / Flux Schnell | ~$0.003 | ~$0.50 | Fastest, decent at pixel-art with strong style prompt |
| OpenAI DALL-E 3 (standard) | $0.04 | ~$7 | Highest quality, worse at strict pixel-art aesthetic |
| OpenAI DALL-E 3 (HD) | $0.08 | ~$13 | Edit `quality = 'hd'` in script |
| Local SD (Automatic1111) | free | free | Best with a pixel-art LoRA, requires GPU + setup |

## Prompt manifest (`art-prompts.json`)

Edit subject lines if you want to tweak the look of a specific card. The `style` block at the top applies to every prompt. Re-run the script after editing — it'll skip files that already exist, so delete the ones you want to regenerate first.

## Tiers

- `base`: every card's primary file (44 images). What the game uses by default. Run this first.
- `qualities`: recipe variants — `tamale-tornado-perfect.png`, `-good.png`, `-plain.png`, `-burnt.png` etc. (24)
- `stages`: ingredient variants — `onion-chopped.png`, `-cooking.png`, `-cooked.png`, `-burnt.png` etc. (88)
- `all`: everything (default)

The game's `CardArt` component falls back automatically: variant → base → emoji. Missing files don't break anything.
