# Qwen2.5-3B Loss Function Ablation Dashboard

Static GitHub Pages dashboard for a controlled loss-function ablation study.

## Experiment

- Model: `Qwen/Qwen2.5-3B-Instruct`
- Dataset: `FreedomIntelligence/medical-o1-reasoning-SFT`
- Train examples: 700
- Test examples: 300
- Epochs: 14
- Seed: 42
- Fine-tuning: 4-bit QLoRA
- Losses:
  - Cross Entropy
  - Label-Smoothed CE, ε = 0.05
  - Focal Loss, γ = 2.0
  - Answer-Weighted CE, 2× answer-token weight

## Run locally

Because the page loads `data/comparison.json` using `fetch`, serve the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Push these files to the `main` branch.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.

## Notes

Raw training-loss values are not compared across objectives because the loss functions have different numerical scales. The dashboard compares metrics from the common post-training evaluator.

The present experiment uses one random seed. A stronger follow-up should repeat the promising objectives across multiple seeds and use an untouched final holdout set.
