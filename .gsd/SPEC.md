# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
To empower the "Next Billion" Indian users by providing a Zero-Prompt, voice-first interface that converts native language intent (Indic/Hinglish) into immediate digital actions using the Sarvam AI stack.

## Goals
1. **Zero-Prompt Voice Interface**: Use Sarvam's Saarika (STT) to understand intent from natural, code-mixed speech without requiring specific commands.
2. **Dynamic Action Engine**: Use Sarvam's Saaras (LLM) to map intent to structured actions (e.g., generating marketing content, inventory alerts, or customer messages).
3. **Indic-First UX**: Ensure the entire loop (from voice input to voice confirmation via Bulbul TTS) feels natural and culturally grounded.

## Non-Goals (Out of Scope)
- Complex authentication or user management for this MVP.
- Real-time payment gateway integration (we will simulate the "Action").
- Support for non-Indian languages (outside of English/Hinglish).

## Users
- Indian small business owners (Kirana stores, boutique owners).
- Non-technical users who find traditional "prompting" or apps difficult to navigate.

## Constraints
- **Primary LLM**: Sarvam AI (Saaras/Sarvam-1).
- **Latency**: Voice processing must feel "near-real-time" to maintain the magic.
- **Tech Stack**: Next.js (Frontend), Node.js (Backend), Sarvam AI APIs.

## Success Criteria
- [ ] Successfully transcribes and understands a complex Hinglish sentence.
- [ ] Generates a relevant digital asset (e.g., an ad flyer or message) based on the voice input.
- [ ] Responds back in a natural regional voice confirming the action.
