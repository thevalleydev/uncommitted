---
title: "Well, I Embarrassed Myself Even Sooner Than Expected: A Modular PSU Cables Tale"
description: "I fried a SATA SSD and HDD mixing Corsair cables on an EVGA PSU. The AI warned me. Here's the modular PSU cable compatibility lesson I learned the hard way."
date: "2026-03-07"
updated: "2026-03-07"
tags:
  - homelab
  - hardware
  - ai-tools
  - lessons-learned
readingTime: "5 min read"
cover: ""
---

I said from the start that this blog was about accountability. Turns out accountability doesn't wait around. I fried a SATA SSD and a hard drive within the first week of this new chapter of my homelab journey. The AI warned me. I didn't fully listen. Here's what happened.

## How We Got Here

A bit of context. I have a 2014 HTPC that has lived many lives. Former home theater box, Linux server, and most recently, a dust collector. When AI started re-igniting my interest in tinkering (more on that dynamic in a future post), this old machine was the first thing I dusted off.

I threw Ubuntu 24 on it, got my solar inverter polling, stood up a web interface, and even launched a crypto mining container. On an AMD A4 7300. I'm pulling in a blistering $0.007 per day. Early retirement is basically locked in.

I also got Ollama running with a qwen 0.5b model. My local LLM could confirm that my solar array exists, read back three numbers, and present them in a completely wrong context. The future is now.

The point is, I was having fun again. And that mattered.

## The Upgrade Plan

My main PC had been freezing intermittently, and I wanted to do some upgrades. The plan was simple: buy new stuff for the main rig, and hand the hand-me-downs down to the 2014 server so it could actually run a local LLM worth talking to.

Step one was dropping a used RTX 3050 8GB into the old Gigabyte board. Dual core AMD, 8 GB of RAM, 2014 vintage. The GPU physically fit after I swapped to a non-slim case, so I powered it on.

The network card did not come up.

What followed was a longer troubleshooting session than I'm going to admit to publicly. I went down a pretty deep rabbit hole with the help of AI trying to figure out what was wrong, and at some point the AI landed on a theory: the cheap PSU in that box couldn't handle the load. Voltage rail collapse, it said. Confidently. Repeatedly.

I'm not saying it was wrong. I'm saying I'll never know, because I swapped the PSU before I fully ruled anything else out.

## Where AI Was Right (And Where I Ignored It)

This is the part that stings a little.

When I told the AI I was swapping in a different PSU, it gave me a clear warning: do not mix modular PSU cables between brands. Just that. A warning without the full explanation of why. I didn't think to ask for clarification, and that's really where this went sideways. If I had pushed back and said "wait, explain why SATA would matter," it almost certainly would have walked me through the whole proprietary pinout issue and I'd have known the stakes. I didn't ask. I just sort of nodded at the warning and moved on.

Some context on the cable situation: I had just bought a new Corsair PSU for my main rig, which came with a fresh set of Corsair cables. The EVGA PSU was the one being handed down to the server. So I had new Corsair cables sitting right there, and the EVGA PSU was going into the build. I followed the AI's guidance for the GPU power and the motherboard connectors and used the correct EVGA cables for those.

But for the SATA power cables, I grabbed the Corsair ones.

My thinking, stated out loud to no one: *"SATA can't really be that different, right?"*

It was. Very different. The drives were dead before the POST screen.

## Why Modular PSU Cables Are Not Interchangeable

Here's the thing I should have already known, and the thing worth putting in writing so maybe someone else doesn't learn it the same way:

**The physical connector fitting means nothing.** The shape and size of a modular PSU cable connector are not standardized on the PSU side. Manufacturers make them look compatible because similar-sized connectors are convenient to produce, not because the pinout matches. You can click a Corsair cable into an EVGA port and it will seat firmly and feel completely correct. Then you turn the power on and the mismatched voltages take out whatever is on the other end.

SATA power connectors on the device side are standardized. The plug that goes into your drive is always the same. But the cable between your PSU and that plug is carrying voltage assignments that depend entirely on which brand of PSU and which specific model that cable was designed for. Mix them up and you might send 12V to a pin that expects 5V. That's not a warning, it's a component funeral.

This isn't even a brand-crossing issue exclusively. Some manufacturers have changed their pinout between product generations. Using a cable from one Corsair series on a different Corsair PSU generation can cause the same problem. Always check the compatibility documentation, or better yet, just use the cables that came with the unit.

## The Other Thing AI Got Wrong

There is a coda to this story that I almost left out.

Throughout all of this, the AI was very firm on one point: updating the BIOS was not going to solve anything. The problem was electrical, it said. The PSU rails were collapsing under load. BIOS had nothing to do with it.

I updated the BIOS anyway, mostly out of desperation.

The 2014 Gigabyte board had a BIOS update that included revised PCIe link negotiation settings. The RTX 3050, a much newer card, had been failing to negotiate a stable PCIe connection with the old board. After the update, it came up without any issues.

The AI was wrong about BIOS. I was wrong about SATA cables. We both made mistakes. The difference is I fried hardware.

## What I Actually Took Away

There are three lessons here, and I already knew all three of them.

The first: trust the warning labels. The AI told me not to mix cable brands. I trusted that guidance for the parts I was more worried about, and I hand-waved it for the part that seemed low-stakes. SATA connectors are boring and ubiquitous and surely they couldn't matter that much. Turns out the stakes are the same regardless of which end of the PC you're working on.

The second: AI is a tool, not an oracle. It gave me a correct warning that I ignored, and it gave me confident wrong information that I also acted on. The value is in knowing which parts to verify independently. The answer to "should I update the BIOS" should never just be "the AI said no." That's a two-minute check with actual patch notes.

The third, and honestly the one that stings the most: back up everything. I lost all the custom code I had built for the solar inverter polling and the web interface. I can recreate it now that I know what I'm doing, maybe better than the first version. But it still burns to destroy your own work through carelessness. I knew this rule before I knew what a computer was. I still didn't follow it.

New SSD is in. The rig is alive. Nothing is set up on it yet, but the 3050 posts and the network card came up after the BIOS update.

Progress. Expensive progress.
