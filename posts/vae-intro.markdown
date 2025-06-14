---
title: "What is wrong with VAEs?"
date: 2025-06-13
tags: [VAE, Generative Models, Deep Learning]
country: us
cover_image: "images/VAE_Basic.jpg"
excerpt: "A deep dive into the limitations of Variational Autoencoders, including ELBO collapse and posterior mismatch."
---

## Introduction

Variational Autoencoders (VAEs) are a popular class of generative models. However, they suffer from blurry samples and latent space issues.

## The ELBO Equation

We optimize the Evidence Lower Bound:

$$
\mathcal{L} = \mathbb{E}_{q_\phi(z|x)} [\log p_\theta(x|z)] - \mathrm{KL}(q_\phi(z|x) \| p(z))
$$

## Visualization

![Latent space visualization](images/portraits/image_placeholder_600x400.svg)