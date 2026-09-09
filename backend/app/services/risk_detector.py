import re


# ============================================================
# DIPLOMATIC RISK CATEGORIES
# ============================================================

RISK_TERMS = {

    # 🔴 VERY HIGH RISK
    "high": {

        "military_conflict": [
            "war",
            "armed conflict",
            "military action",
            "military operation",
            "invasion",
            "occupation",
            "airstrike",
            "air strikes",
            "missile strike",
            "bombing",
            "attack",
            "armed attack",
            "offensive",
            "ground offensive",
        ],

        "threats": [
            "threat",
            "threaten",
            "threatened",
            "ultimatum",
            "retaliation",
            "retaliate",
            "retaliatory action",
            "pay the price",
            "consequences",
            "red line",
            "cross the red line",
            "will respond",
            "force will be used",
            "we will respond",
        ],

        "nuclear_wmd": [
            "nuclear weapon",
            "nuclear weapons",
            "nuclear war",
            "nuclear strike",
            "nuclear attack",
            "nuclear deterrence",
            "nuclear escalation",
            "weapons of mass destruction",
            "chemical weapons",
            "biological weapons",
            "wmd",
        ],

        "terrorism": [
            "terrorism",
            "terrorist attack",
            "terrorist organization",
            "terrorist group",
            "extremist group",
            "extremism",
            "violent extremism",
            "terrorist threat",
        ],
    },


    # 🟠 MEDIUM-HIGH RISK
    "medium_high": {

        "territorial_sovereignty": [
            "sovereignty",
            "territorial integrity",
            "territorial dispute",
            "border dispute",
            "disputed territory",
            "territorial claim",
            "territorial claims",
            "occupation",
            "annexation",
            "annex",
            "separatist",
            "secession",
        ],

        "military_security": [
            "military",
            "troops",
            "soldiers",
            "armed forces",
            "military forces",
            "military deployment",
            "military buildup",
            "military presence",
            "missile",
            "missiles",
            "weapons",
            "arms",
            "defense system",
            "air defense",
            "naval forces",
            "security threat",
            "security crisis",
        ],

        "escalation": [
            "escalation",
            "escalate",
            "escalating",
            "confrontation",
            "hostilities",
            "renewed fighting",
            "military confrontation",
            "dangerous escalation",
            "rising tensions",
            "heightened tensions",
            "growing tensions",
        ],

        "sanctions_pressure": [
            "sanctions",
            "economic sanctions",
            "trade sanctions",
            "financial sanctions",
            "secondary sanctions",
            "sanction regime",
            "embargo",
            "trade embargo",
            "economic pressure",
            "maximum pressure",
            "punitive measures",
            "restrictive measures",
        ],

        "diplomatic_breakdown": [
            "diplomatic relations suspended",
            "diplomatic relations severed",
            "break diplomatic relations",
            "recall ambassador",
            "expel ambassador",
            "diplomatic crisis",
            "diplomatic breakdown",
            "withdraw from negotiations",
            "suspend negotiations",
            "talks have failed",
            "negotiations have failed",
        ],
    },


    # 🟡 MEDIUM RISK
    "medium": {

        "humanitarian": [
            "humanitarian crisis",
            "humanitarian emergency",
            "refugee crisis",
            "refugees",
            "displacement",
            "displaced persons",
            "civilian casualties",
            "civilian deaths",
            "humanitarian aid",
            "humanitarian assistance",
            "food crisis",
            "famine",
            "humanitarian corridor",
        ],

        "human_rights": [
            "human rights",
            "human rights violation",
            "rights violation",
            "civilian rights",
            "freedom of expression",
            "freedom of speech",
            "political prisoners",
            "arbitrary detention",
            "forced displacement",
            "war crimes",
            "crimes against humanity",
            "genocide",
        ],

        "international_law": [
            "international law",
            "international court",
            "international criminal court",
            "international justice",
            "legal violation",
            "law violation",
            "violation of international law",
            "legal obligation",
            "treaty violation",
            "breach of treaty",
        ],

        "border_security": [
            "border security",
            "border crossing",
            "border incident",
            "border violation",
            "cross-border attack",
            "cross-border violence",
            "illegal crossing",
            "border tensions",
        ],

        "political_sensitivity": [
            "regime",
            "government legitimacy",
            "political instability",
            "political crisis",
            "election interference",
            "foreign interference",
            "interference in internal affairs",
            "political pressure",
            "domestic politics",
            "regime change",
        ],

        "economic_sensitivity": [
            "trade dispute",
            "trade war",
            "trade barrier",
            "tariff",
            "tariffs",
            "export restrictions",
            "import restrictions",
            "economic blockade",
            "market access",
            "supply chain disruption",
            "energy security",
            "energy crisis",
        ],

        "diplomatic_sensitivity": [
            "disagreement",
            "serious concern",
            "deep concern",
            "strong objection",
            "condemn",
            "condemnation",
            "protest",
            "demand",
            "reject",
            "rejection",
            "dispute",
            "disagreement",
            "deadlock",
            "stalemate",
        ],
    },


    # 🟢 LOW RISK / DIPLOMATIC SENSITIVITY
    "low": {

        "diplomatic_language": [
            "concern",
            "dialogue",
            "consultation",
            "negotiation",
            "cooperation",
            "partnership",
            "agreement",
            "treaty",
            "proposal",
            "initiative",
            "framework",
            "understanding",
            "commitment",
            "joint statement",
            "peace process",
            "confidence-building measures",
            "constructive engagement",
        ],
    },
}


# ============================================================
# AMBIGUITY DETECTION
# ============================================================

AMBIGUOUS_TERMS = {

    "pronouns": [
        "they",
        "them",
        "their",
        "he",
        "him",
        "his",
        "she",
        "her",
        "hers",
        "we",
        "us",
        "our",
        "ours",
        "you",
        "your",
    ],

    "demonstratives": [
        "this",
        "that",
        "these",
        "those",
        "it",
    ],

    "diplomatic_references": [
        "both sides",
        "both countries",
        "both parties",
        "the other side",
        "the other country",
        "the other party",
        "the parties",
        "the two sides",
        "the two countries",
        "the two governments",
    ],

    "vague_objects": [
        "the agreement",
        "the proposal",
        "the decision",
        "the initiative",
        "the framework",
        "the plan",
        "the arrangement",
        "the matter",
        "the issue",
        "the situation",
        "the incident",
        "the case",
    ],

    "vague_quantities": [
        "some",
        "many",
        "several",
        "few",
        "most",
        "significant",
        "substantial",
        "considerable",
        "large number",
        "small number",
    ],

    "vague_time": [
        "soon",
        "shortly",
        "later",
        "recently",
        "in the near future",
        "at some point",
        "for some time",
        "eventually",
        "as soon as possible",
    ],

    "vague_commitments": [
        "appropriate action",
        "necessary steps",
        "appropriate measures",
        "necessary measures",
        "all options",
        "all necessary measures",
        "whatever is necessary",
        "further steps",
        "appropriate response",
    ],
}


# ============================================================
# UNCERTAINTY / MODAL LANGUAGE
# ============================================================

UNCERTAINTY_TERMS = [
    "may",
    "might",
    "could",
    "possibly",
    "perhaps",
    "potentially",
    "likely",
    "unlikely",
    "appears",
    "appeared",
    "seems",
    "seemed",
    "reportedly",
    "allegedly",
    "according to reports",
    "we believe",
    "we understand",
    "we expect",
]


# ============================================================
# ATTRIBUTION RISK
# ============================================================

ATTRIBUTION_TERMS = [
    "we accuse",
    "they accuse",
    "accused",
    "alleged",
    "allegedly",
    "blame",
    "blamed",
    "responsible for",
    "responsibility",
    "culprit",
    "provocation",
    "provoked",
    "violation",
    "violated",
    "breached",
    "illegal",
    "illegitimate",
]


# ============================================================
# STRONG / ESCALATORY LANGUAGE
# ============================================================

ESCALATORY_PHRASES = [
    "we demand",
    "we insist",
    "we reject",
    "we condemn",
    "we will not accept",
    "unacceptable",
    "completely unacceptable",
    "grave concern",
    "serious consequences",
    "severe consequences",
    "appropriate response",
    "decisive action",
    "firm action",
    "strong action",
    "will respond",
    "must stop",
    "must immediately stop",
]


# ============================================================
# HELPER
# ============================================================

def _contains_term(text_lower: str, term: str) -> bool:
    pattern = r"\b" + re.escape(term.lower()) + r"\b"
    return bool(re.search(pattern, text_lower))


# ============================================================
# MAIN DETECTOR
# ============================================================

def detect_risk(text: str):

    if not text or not text.strip():
        return {
            "risk_level": "low",
            "risk_score": 0,
            "risk_terms": [],
            "risk_categories": [],
            "ambiguity": False,
            "ambiguity_score": 0,
            "ambiguous_terms": [],
            "ambiguity_categories": [],
            "uncertainty": False,
            "uncertainty_terms": [],
            "attribution_risk": False,
            "attribution_terms": [],
            "escalatory_language": False,
            "escalatory_terms": [],
        }

    text_lower = text.lower().strip()

    # --------------------------------------------------------
    # RISK DETECTION
    # --------------------------------------------------------

    detected_risks = []
    risk_categories = []
    risk_score = 0

    severity_weights = {
        "high": 10,
        "medium_high": 7,
        "medium": 4,
        "low": 1,
    }

    for level, categories in RISK_TERMS.items():

        for category, terms in categories.items():

            for term in terms:

                if _contains_term(text_lower, term):

                    detected_risks.append({
                        "term": term,
                        "level": level,
                        "category": category,
                    })

                    if category not in risk_categories:
                        risk_categories.append(category)

                    risk_score += severity_weights[level]

    # --------------------------------------------------------
    # AMBIGUITY DETECTION
    # --------------------------------------------------------

    ambiguous_terms = []
    ambiguity_categories = []

    for category, terms in AMBIGUOUS_TERMS.items():

        for term in terms:

            if _contains_term(text_lower, term):

                ambiguous_terms.append(term)

                if category not in ambiguity_categories:
                    ambiguity_categories.append(category)

    # Remove duplicates while preserving order
    ambiguous_terms = list(dict.fromkeys(ambiguous_terms))

    ambiguity_score = len(ambiguous_terms)

    # --------------------------------------------------------
    # UNCERTAINTY
    # --------------------------------------------------------

    uncertainty_terms = []

    for term in UNCERTAINTY_TERMS:

        if _contains_term(text_lower, term):
            uncertainty_terms.append(term)

    uncertainty_terms = list(dict.fromkeys(uncertainty_terms))

    # --------------------------------------------------------
    # ATTRIBUTION
    # --------------------------------------------------------

    attribution_terms = []

    for term in ATTRIBUTION_TERMS:

        if _contains_term(text_lower, term):
            attribution_terms.append(term)

    attribution_terms = list(dict.fromkeys(attribution_terms))

    # --------------------------------------------------------
    # ESCALATORY LANGUAGE
    # --------------------------------------------------------

    escalatory_terms = []

    for term in ESCALATORY_PHRASES:

        if _contains_term(text_lower, term):
            escalatory_terms.append(term)

    escalatory_terms = list(dict.fromkeys(escalatory_terms))

    # --------------------------------------------------------
    # ADDITIONAL RISK SCORE
    # --------------------------------------------------------

    if uncertainty_terms:
        risk_score += 1

    if attribution_terms:
        risk_score += 3

    if escalatory_terms:
        risk_score += 5

    # --------------------------------------------------------
    # FINAL RISK LEVEL
    # --------------------------------------------------------

    if any(item["level"] == "high" for item in detected_risks):
        risk_level = "high"

    elif escalatory_terms and (
        attribution_terms or detected_risks
    ):
        risk_level = "high"

    elif any(item["level"] == "medium_high" for item in detected_risks):
        risk_level = "medium-high"

    elif detected_risks or attribution_terms:
        risk_level = "medium"

    else:
        risk_level = "low"

    # --------------------------------------------------------
    # RETURN
    # --------------------------------------------------------

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,

        "risk_terms": detected_risks,
        "risk_categories": risk_categories,

        "ambiguity": bool(ambiguous_terms),
        "ambiguity_score": ambiguity_score,
        "ambiguous_terms": ambiguous_terms,
        "ambiguity_categories": ambiguity_categories,

        "uncertainty": bool(uncertainty_terms),
        "uncertainty_terms": uncertainty_terms,

        "attribution_risk": bool(attribution_terms),
        "attribution_terms": attribution_terms,

        "escalatory_language": bool(escalatory_terms),
        "escalatory_terms": escalatory_terms,
    }