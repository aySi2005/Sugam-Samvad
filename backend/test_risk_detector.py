from app.services.risk_detector import detect_risk


tests = [
    "India and France discussed economic cooperation.",
    "The two countries warned of possible sanctions.",
    "The government may consider military action.",
    "They will continue the dialogue.",
    "We demand that they immediately stop their actions.",
    "The other side must take appropriate measures.",
    "There could be serious consequences if the agreement fails.",
    "We condemn the attack and hold them responsible.",
    "The border dispute has created rising tensions.",
    "The country will defend its sovereignty and territorial integrity.",
    "The parties remain committed to a peaceful resolution.",
    "We may consider further steps in the near future.",
    "The government has reportedly violated international law.",
    "All options remain on the table.",
    "The situation could escalate into an armed conflict.",
    "The two sides agreed to continue consultations.",
    "Nuclear weapons must never be used.",
    "We strongly reject this unacceptable decision.",
]


for text in tests:
    print("\nTEXT:", text)
    print(detect_risk(text))