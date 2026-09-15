from typing import Optional


DIPLOMATIC_GLOSSARY = {
    "diplomatic immunity": {
        "category": "diplomacy",
        "definition": "Legal protections granted to diplomats under international law.",
        "preferred_terms": {
            "en": "diplomatic immunity",
            "hi": "राजनयिक उन्मुक्ति",
            "fr": "immunité diplomatique",
            "ar": "الحصانة الدبلوماسية",
            "es": "inmunidad diplomática",
        },
    },

    "diplomatic relations": {
        "category": "international_relations",
        "definition": "Formal relations maintained between states through diplomatic channels.",
        "preferred_terms": {
            "en": "diplomatic relations",
            "hi": "राजनयिक संबंध",
            "fr": "relations diplomatiques",
            "ar": "العلاقات الدبلوماسية",
            "es": "relaciones diplomáticas",
        },
    },

    "bilateral cooperation": {
        "category": "international_relations",
        "definition": "Cooperation between two countries.",
        "preferred_terms": {
            "en": "bilateral cooperation",
            "hi": "द्विपक्षीय सहयोग",
            "fr": "coopération bilatérale",
            "ar": "التعاون الثنائي",
            "es": "cooperación bilateral",
        },
    },

    "multilateral cooperation": {
        "category": "international_relations",
        "definition": "Cooperation involving multiple countries or international organizations.",
        "preferred_terms": {
            "en": "multilateral cooperation",
            "hi": "बहुपक्षीय सहयोग",
            "fr": "coopération multilatérale",
            "ar": "التعاون المتعدد الأطراف",
            "es": "cooperación multilateral",
        },
    },

    "strategic dialogue": {
        "category": "foreign_policy",
        "definition": "Structured high-level discussions concerning strategic and foreign policy matters.",
        "preferred_terms": {
            "en": "strategic dialogue",
            "hi": "रणनीतिक वार्ता",
            "fr": "dialogue stratégique",
            "ar": "الحوار الاستراتيجي",
            "es": "diálogo estratégico",
        },
    },

    "strategic interests": {
        "category": "foreign_policy",
        "definition": "Long-term interests considered important to a state's security, economy, or foreign policy.",
        "preferred_terms": {
            "en": "strategic interests",
            "hi": "रणनीतिक हित",
            "fr": "intérêts stratégiques",
            "ar": "المصالح الاستراتيجية",
            "es": "intereses estratégicos",
        },
    },

    "regional stability": {
        "category": "security",
        "definition": "A condition in which a region experiences relatively stable political and security relations.",
        "preferred_terms": {
            "en": "regional stability",
            "hi": "क्षेत्रीय स्थिरता",
            "fr": "stabilité régionale",
            "ar": "الاستقرار الإقليمي",
            "es": "estabilidad regional",
        },
    },

    "regional security": {
        "category": "security",
        "definition": "Security conditions and cooperative measures within a geographic region.",
        "preferred_terms": {
            "en": "regional security",
            "hi": "क्षेत्रीय सुरक्षा",
            "fr": "sécurité régionale",
            "ar": "الأمن الإقليمي",
            "es": "seguridad regional",
        },
    },

    "collective security": {
        "category": "security",
        "definition": "A system in which states cooperate to maintain peace and respond to threats.",
        "preferred_terms": {
            "en": "collective security",
            "hi": "सामूहिक सुरक्षा",
            "fr": "sécurité collective",
            "ar": "الأمن الجماعي",
            "es": "seguridad colectiva",
        },
    },

    "national security": {
        "category": "security",
        "definition": "Protection of a state's people, territory, institutions, and strategic interests.",
        "preferred_terms": {
            "en": "national security",
            "hi": "राष्ट्रीय सुरक्षा",
            "fr": "sécurité nationale",
            "ar": "الأمن القومي",
            "es": "seguridad nacional",
        },
    },

    "border security": {
        "category": "security",
        "definition": "Measures used to protect and manage a country's borders.",
        "preferred_terms": {
            "en": "border security",
            "hi": "सीमा सुरक्षा",
            "fr": "sécurité des frontières",
            "ar": "أمن الحدود",
            "es": "seguridad fronteriza",
        },
    },

    "border dispute": {
        "category": "security",
        "definition": "A disagreement between states concerning the location or control of a border.",
        "preferred_terms": {
            "en": "border dispute",
            "hi": "सीमा विवाद",
            "fr": "différend frontalier",
            "ar": "نزاع حدودي",
            "es": "disputa fronteriza",
        },
    },

    "peacekeeping": {
        "category": "conflict_resolution",
        "definition": "International efforts intended to help maintain peace in areas affected by conflict.",
        "preferred_terms": {
            "en": "peacekeeping",
            "hi": "शांति स्थापना",
            "fr": "maintien de la paix",
            "ar": "حفظ السلام",
            "es": "mantenimiento de la paz",
        },
    },

    "peacebuilding": {
        "category": "conflict_resolution",
        "definition": "Long-term efforts to address causes of conflict and establish sustainable peace.",
        "preferred_terms": {
            "en": "peacebuilding",
            "hi": "शांति निर्माण",
            "fr": "consolidation de la paix",
            "ar": "بناء السلام",
            "es": "consolidación de la paz",
        },
    },

    "humanitarian assistance": {
        "category": "humanitarian",
        "definition": "Assistance provided to people affected by conflict, disasters, or humanitarian emergencies.",
        "preferred_terms": {
            "en": "humanitarian assistance",
            "hi": "मानवीय सहायता",
            "fr": "aide humanitaire",
            "ar": "المساعدة الإنسانية",
            "es": "asistencia humanitaria",
        },
    },

    "humanitarian crisis": {
        "category": "humanitarian",
        "definition": "A situation in which large numbers of people face serious threats to life, health, or basic needs.",
        "preferred_terms": {
            "en": "humanitarian crisis",
            "hi": "मानवीय संकट",
            "fr": "crise humanitaire",
            "ar": "أزمة إنسانية",
            "es": "crisis humanitaria",
        },
    },

    "human rights": {
        "category": "human_rights",
        "definition": "Fundamental rights and freedoms recognized as belonging to all people.",
        "preferred_terms": {
            "en": "human rights",
            "hi": "मानवाधिकार",
            "fr": "droits humains",
            "ar": "حقوق الإنسان",
            "es": "derechos humanos",
        },
    },

    "international law": {
        "category": "international_law",
        "definition": "Rules and principles governing relations between states and other international actors.",
        "preferred_terms": {
            "en": "international law",
            "hi": "अंतरराष्ट्रीय कानून",
            "fr": "droit international",
            "ar": "القانون الدولي",
            "es": "derecho internacional",
        },
    },

    "rule of law": {
        "category": "governance",
        "definition": "The principle that laws apply consistently and govern the exercise of public authority.",
        "preferred_terms": {
            "en": "rule of law",
            "hi": "कानून का शासन",
            "fr": "État de droit",
            "ar": "سيادة القانون",
            "es": "Estado de derecho",
        },
    },

    "non-interference": {
        "category": "foreign_policy",
        "definition": "The principle of refraining from interfering in the internal affairs of another state.",
        "preferred_terms": {
            "en": "non-interference",
            "hi": "अहस्तक्षेप",
            "fr": "non-ingérence",
            "ar": "عدم التدخل",
            "es": "no injerencia",
        },
    },

    "non-aggression": {
        "category": "security",
        "definition": "A commitment by states to refrain from using force against one another.",
        "preferred_terms": {
            "en": "non-aggression",
            "hi": "अनाक्रमण",
            "fr": "non-agression",
            "ar": "عدم الاعتداء",
            "es": "no agresión",
        },
    },

    "arms control": {
        "category": "security",
        "definition": "International efforts to regulate, limit, or reduce weapons and military capabilities.",
        "preferred_terms": {
            "en": "arms control",
            "hi": "हथियार नियंत्रण",
            "fr": "maîtrise des armements",
            "ar": "الحد من التسلح",
            "es": "control de armamentos",
        },
    },

    "disarmament": {
        "category": "security",
        "definition": "The reduction or elimination of weapons or military capabilities.",
        "preferred_terms": {
            "en": "disarmament",
            "hi": "निरस्त्रीकरण",
            "fr": "désarmement",
            "ar": "نزع السلاح",
            "es": "desarme",
        },
    },

    "nuclear non-proliferation": {
        "category": "nuclear_security",
        "definition": "International efforts to prevent the spread of nuclear weapons and related capabilities.",
        "preferred_terms": {
            "en": "nuclear non-proliferation",
            "hi": "परमाणु अप्रसार",
            "fr": "non-prolifération nucléaire",
            "ar": "عدم الانتشار النووي",
            "es": "no proliferación nuclear",
        },
    },

    "economic diplomacy": {
        "category": "economic_diplomacy",
        "definition": "Use of diplomatic engagement to advance economic and commercial interests.",
        "preferred_terms": {
            "en": "economic diplomacy",
            "hi": "आर्थिक कूटनीति",
            "fr": "diplomatie économique",
            "ar": "الدبلوماسية الاقتصادية",
            "es": "diplomacia económica",
        },
    },

    "trade relations": {
        "category": "economic_diplomacy",
        "definition": "Economic and commercial relations between countries.",
        "preferred_terms": {
            "en": "trade relations",
            "hi": "व्यापारिक संबंध",
            "fr": "relations commerciales",
            "ar": "العلاقات التجارية",
            "es": "relaciones comerciales",
        },
    },

    "trade barrier": {
        "category": "economic_diplomacy",
        "definition": "A policy or measure that restricts or makes international trade more difficult.",
        "preferred_terms": {
            "en": "trade barrier",
            "hi": "व्यापार बाधा",
            "fr": "barrière commerciale",
            "ar": "حاجز تجاري",
            "es": "barrera comercial",
        },
    },

    "economic cooperation": {
        "category": "economic_diplomacy",
        "definition": "Cooperation between countries in areas such as trade, investment, finance, and development.",
        "preferred_terms": {
            "en": "economic cooperation",
            "hi": "आर्थिक सहयोग",
            "fr": "coopération économique",
            "ar": "التعاون الاقتصادي",
            "es": "cooperación económica",
        },
    },

    "development cooperation": {
        "category": "international_development",
        "definition": "Cooperation between countries or institutions to support economic and social development.",
        "preferred_terms": {
            "en": "development cooperation",
            "hi": "विकास सहयोग",
            "fr": "coopération au développement",
            "ar": "التعاون الإنمائي",
            "es": "cooperación para el desarrollo",
        },
    },

    "official visit": {
        "category": "diplomacy",
        "definition": "A formal visit by a government representative or senior official to another country.",
        "preferred_terms": {
            "en": "official visit",
            "hi": "आधिकारिक यात्रा",
            "fr": "visite officielle",
            "ar": "زيارة رسمية",
            "es": "visita oficial",
        },
    },

    "state visit": {
        "category": "diplomacy",
        "definition": "A formal visit by a head of state to another country.",
        "preferred_terms": {
            "en": "state visit",
            "hi": "राजकीय यात्रा",
            "fr": "visite d'État",
            "ar": "زيارة دولة",
            "es": "visita de Estado",
        },
    },

    "summit meeting": {
        "category": "diplomacy",
        "definition": "A high-level meeting involving senior national or international leaders.",
        "preferred_terms": {
            "en": "summit meeting",
            "hi": "शिखर बैठक",
            "fr": "réunion au sommet",
            "ar": "اجتماع قمة",
            "es": "reunión de alto nivel",
        },
    },

    "joint statement": {
        "category": "diplomacy",
        "definition": "A statement formally issued by two or more parties together.",
        "preferred_terms": {
            "en": "joint statement",
            "hi": "संयुक्त वक्तव्य",
            "fr": "déclaration conjointe",
            "ar": "بيان مشترك",
            "es": "declaración conjunta",
        },
    },

    "memorandum of understanding": {
        "category": "diplomacy",
        "definition": "A formal document describing a shared understanding or intended cooperation between parties.",
        "preferred_terms": {
            "en": "memorandum of understanding",
            "hi": "समझौता ज्ञापन",
            "fr": "mémorandum d'entente",
            "ar": "مذكرة تفاهم",
            "es": "memorando de entendimiento",
        },
    },

    "consular relations": {
        "category": "diplomacy",
        "definition": "Official relations concerning consular services and the protection of citizens abroad.",
        "preferred_terms": {
            "en": "consular relations",
            "hi": "वाणिज्यिक संबंध",
            "fr": "relations consulaires",
            "ar": "العلاقات القنصلية",
            "es": "relaciones consulares",
        },
    },

    "constructive engagement": {
        "category": "diplomacy",
        "definition": "A diplomatic approach based on continued engagement and dialogue to address disagreements.",
        "preferred_terms": {
            "en": "constructive engagement",
            "hi": "रचनात्मक सहभागिता",
            "fr": "engagement constructif",
            "ar": "المشاركة البناءة",
            "es": "compromiso constructivo",
        },
    },

    "political will": {
        "category": "diplomacy",
        "definition": "The willingness of political leaders or governments to take action on an issue.",
        "preferred_terms": {
            "en": "political will",
            "hi": "राजनीतिक इच्छाशक्ति",
            "fr": "volonté politique",
            "ar": "الإرادة السياسية",
            "es": "voluntad política",
        },
    },

    "common ground": {
        "category": "negotiation",
        "definition": "Areas of shared interests or agreement between parties.",
        "preferred_terms": {
            "en": "common ground",
            "hi": "साझा आधार",
            "fr": "terrain d'entente",
            "ar": "أرضية مشتركة",
            "es": "puntos en común",
        },
    },

    "consensus": {
        "category": "negotiation",
        "definition": "General agreement reached among participating parties.",
        "preferred_terms": {
            "en": "consensus",
            "hi": "सहमति",
            "fr": "consensus",
            "ar": "توافق",
            "es": "consenso",
        },
    },

    "negotiating position": {
        "category": "negotiation",
        "definition": "The stated position or objectives of a party during negotiations.",
        "preferred_terms": {
            "en": "negotiating position",
            "hi": "वार्ता की स्थिति",
            "fr": "position de négociation",
            "ar": "الموقف التفاوضي",
            "es": "posición negociadora",
        },
    },

    "diplomatic solution": {
        "category": "conflict_resolution",
        "definition": "A solution reached through diplomatic engagement rather than coercion or force.",
        "preferred_terms": {
            "en": "diplomatic solution",
            "hi": "राजनयिक समाधान",
            "fr": "solution diplomatique",
            "ar": "حل دبلوماسي",
            "es": "solución diplomática",
        },
    },

    "lasting peace": {
        "category": "conflict_resolution",
        "definition": "A durable state of peace intended to prevent the recurrence of conflict.",
        "preferred_terms": {
            "en": "lasting peace",
            "hi": "स्थायी शांति",
            "fr": "paix durable",
            "ar": "سلام دائم",
            "es": "paz duradera",
        },
    },

    "territorial dispute": {
        "category": "security",
        "definition": "A disagreement between states over sovereignty or control of a territory.",
        "preferred_terms": {
            "en": "territorial dispute",
            "hi": "क्षेत्रीय विवाद",
            "fr": "différend territorial",
            "ar": "نزاع إقليمي",
            "es": "disputa territorial",
        },
    },

    "use of force": {
        "category": "international_law",
        "definition": "The use of military or physical force in international relations.",
        "preferred_terms": {
            "en": "use of force",
            "hi": "बल का प्रयोग",
            "fr": "recours à la force",
            "ar": "استخدام القوة",
            "es": "uso de la fuerza",
        },
    },

    "peaceful settlement of disputes": {
        "category": "international_law",
        "definition": "The principle of resolving international disputes through peaceful means.",
        "preferred_terms": {
            "en": "peaceful settlement of disputes",
            "hi": "विवादों का शांतिपूर्ण समाधान",
            "fr": "règlement pacifique des différends",
            "ar": "التسوية السلمية للمنازعات",
            "es": "solución pacífica de controversias",
        },
    },
}


def find_terms(text: str):
    """
    Find diplomatic glossary terms appearing
    in the supplied text.
    """

    if not text:
        return []

    text_lower = text.lower()

    matches = []

    for term, data in DIPLOMATIC_GLOSSARY.items():

        if term.lower() in text_lower:

            matches.append({
                "term": term,
                "category": data["category"],
                "definition": data["definition"],
                "preferred_terms": data[
                    "preferred_terms"
                ],
            })

    return matches


def get_preferred_term(
    term: str,
    language: str,
) -> Optional[str]:

    entry = DIPLOMATIC_GLOSSARY.get(
        term.lower()
    )

    if not entry:
        return None

    return entry["preferred_terms"].get(
        language
    )