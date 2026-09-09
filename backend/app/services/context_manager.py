from collections import deque
import re


class ContextManager:
    """
    Maintains rolling conversation context and
    tracks important diplomatic entities.
    """

    def __init__(self, max_sentences: int = 10):
        self.max_sentences = max_sentences

        self.history = deque(
            maxlen=max_sentences
        )

    # -------------------------------------------------
    # ENTITY EXTRACTION
    # -------------------------------------------------

    def extract_entities(self, text: str):
        """
        Extract important entities from a sentence.

        Currently focuses on:
        - Countries
        - Diplomatic agreements
        - Treaties
        - Decisions
        - Proposals
        - Partnerships
        - Meetings
        - Summits
        - Declarations
        - Resolutions
        """

        entities = []

        if not text:
            return entities

        # Common diplomatic entities.
        known_entities = [
            # Countries
            "India",
            "France",
            "United States",
            "United Kingdom",
            "Russia",
            "Ukraine",
            "China",
            "Japan",
            "Germany",
            "Italy",
            "Canada",
            "Australia",
            "Brazil",
            "Pakistan",
            "Bangladesh",
            "Nepal",
            "Sri Lanka",
            "Iran",
            "Israel",
            "Saudi Arabia",
            "United Arab Emirates",
            "South Korea",
            "North Korea",
            "Indonesia",
            "Vietnam",
            "South Africa",
            "Egypt",
            "Turkey",
            "Afghanistan",

            # International organizations
            "United Nations",
            "European Union",
            "NATO",
            "BRICS",
            "G7",
            "G20",
            "ASEAN",
            "SAARC",
            "African Union",
            "World Trade Organization",
            "International Monetary Fund",
            "World Bank",
            "International Court of Justice",
            "International Criminal Court",

            # Diplomatic / political bodies
            "Security Council",
            "UN Security Council",
            "General Assembly",
            "Parliament",
            "Ministry of External Affairs",
            "Foreign Ministry",

            # Diplomatic roles
            "Prime Minister",
            "President",
            "Foreign Minister",
            "External Affairs Minister",
            "Secretary of State",
            "Ambassador",
            "High Commissioner",
            "Diplomat",
            "Special Envoy",
            "Representative",
        ]

        for entity in known_entities:

            pattern = (
                r"\b"
                + re.escape(entity)
                + r"\b"
            )

            if re.search(
                pattern,
                text,
                re.IGNORECASE,
            ):
                entities.append({
                    "text": entity,
                    "type": "named_entity",
                })

        # Diplomatic objects.
        object_patterns = [
            # Agreements
            (
                r"\b(?:an?|the)\s+agreement\b",
                "the agreement",
                "agreement",
            ),
            (
                r"\b(?:an?|the)\s+bilateral agreement\b",
                "the bilateral agreement",
                "agreement",
            ),
            (
                r"\b(?:an?|the)\s+trade agreement\b",
                "the trade agreement",
                "agreement",
            ),
            (
                r"\b(?:an?|the)\s+peace agreement\b",
                "the peace agreement",
                "agreement",
            ),
            (
                r"\b(?:an?|the)\s+security agreement\b",
                "the security agreement",
                "agreement",
            ),

            # Treaties
            (
                r"\b(?:an?|the)\s+treaty\b",
                "the treaty",
                "treaty",
            ),
            (
                r"\b(?:an?|the)\s+peace treaty\b",
                "the peace treaty",
                "treaty",
            ),

            # Diplomatic initiatives
            (
                r"\b(?:an?|the)\s+proposal\b",
                "the proposal",
                "proposal",
            ),
            (
                r"\b(?:an?|the)\s+initiative\b",
                "the initiative",
                "initiative",
            ),
            (
                r"\b(?:an?|the)\s+framework\b",
                "the framework",
                "framework",
            ),
            (
                r"\b(?:an?|the)\s+roadmap\b",
                "the roadmap",
                "roadmap",
            ),

            # Political decisions
            (
                r"\b(?:a|the)\s+decision\b",
                "the decision",
                "decision",
            ),
            (
                r"\b(?:a|the)\s+resolution\b",
                "the resolution",
                "resolution",
            ),
            (
                r"\b(?:a|the)\s+declaration\b",
                "the declaration",
                "declaration",
            ),
            (
                r"\b(?:a|the)\s+statement\b",
                "the statement",
                "statement",
            ),

            # Diplomatic relationships
            (
                r"\b(?:a|the)\s+partnership\b",
                "the partnership",
                "partnership",
            ),
            (
                r"\b(?:a|the)\s+relationship\b",
                "the relationship",
                "relationship",
            ),
            (
                r"\b(?:a|the)\s+strategic partnership\b",
                "the strategic partnership",
                "partnership",
            ),
            (
                r"\b(?:a|the)\s+bilateral relationship\b",
                "the bilateral relationship",
                "relationship",
            ),

            # Events
            (
                r"\b(?:a|the)\s+meeting\b",
                "the meeting",
                "meeting",
            ),
            (
                r"\b(?:a|the)\s+summit\b",
                "the summit",
                "summit",
            ),
            (
                r"\b(?:a|the)\s+dialogue\b",
                "the dialogue",
                "dialogue",
            ),
            (
                r"\b(?:a|the)\s+negotiation\b",
                "the negotiation",
                "negotiation",
            ),
            (
                r"\b(?:a|the)\s+consultation\b",
                "the consultation",
                "consultation",
            ),

            # Diplomatic positions / disputes
            (
                r"\b(?:a|the)\s+position\b",
                "the position",
                "position",
            ),
            (
                r"\b(?:a|the)\s+dispute\b",
                "the dispute",
                "dispute",
            ),
            (
                r"\b(?:a|the)\s+conflict\b",
                "the conflict",
                "conflict",
            ),
            (
                r"\b(?:a|the)\s+ceasefire\b",
                "the ceasefire",
                "ceasefire",
            ),

            # Cooperation
            (
                r"\b(?:a|the)\s+cooperation\b",
                "the cooperation",
                "cooperation",
            ),
            (
                r"\b(?:a|the)\s+collaboration\b",
                "the collaboration",
                "collaboration",
            ),
            (
                r"\b(?:a|the)\s+dialogue\b",
                "the dialogue",
                "dialogue",
            ),
        ]

        for pattern, normalized, entity_type in object_patterns:

            if re.search(
                pattern,
                text,
                re.IGNORECASE,
            ):
                entities.append({
                    "text": normalized,
                    "type": entity_type,
                })

        return entities

    # -------------------------------------------------
    # ADD SENTENCE
    # -------------------------------------------------

    def add_sentence(
        self,
        text: str,
        language: str = "auto",
    ):
        if not text or not text.strip():
            return

        text = text.strip()

        entities = self.extract_entities(
            text
        )

        self.history.append({
            "text": text,
            "language": language,
            "entities": entities,
        })

        if entities:
            print(
                "🔎 ENTITIES FOUND:",
                [
                    entity["text"]
                    for entity in entities
                ],
            )

    # -------------------------------------------------
    # HISTORY
    # -------------------------------------------------

    def get_history(self):
        return list(self.history)

    def get_context_text(self):
        if not self.history:
            return ""

        lines = []

        for item in self.history:

            lines.append(
                f"[{item['language']}] "
                f"{item['text']}"
            )

        return "\n".join(lines)

    def get_recent_context(
        self,
        max_sentences: int = 3,
    ):
        history = list(self.history)

        return history[
            -max_sentences:
        ]

    # -------------------------------------------------
    # ENTITY MEMORY
    # -------------------------------------------------

    def get_recent_entities(self):
        """
        Return unique entities from recent
        conversation history.
        """

        entities = []

        for item in reversed(
            list(self.history)
        ):

            for entity in item.get(
                "entities",
                [],
            ):

                entity_text = entity["text"]

                already_exists = any(
                    existing["text"]
                    == entity_text
                    for existing in entities
                )

                if not already_exists:
                    entities.append(entity)

        return entities

    def get_countries(self):
        """
        Return recently mentioned countries.
        """

        countries = []

        for entity in self.get_recent_entities():

            if entity["text"] in [
                "India",
                "France",
                "United States",
                "United Kingdom",
                "Russia",
                "Ukraine",
                "China",
                "Japan",
                "Germany",
                "Italy",
                "Canada",
                "Australia",
                "Brazil",
                "Pakistan",
                "Bangladesh",
                "Nepal",
                "Sri Lanka",
                "Iran",
                "Israel",
                "Saudi Arabia",
                "United Arab Emirates",
            ]:

                countries.append(
                    entity["text"]
                )

        return countries

    # -------------------------------------------------
    # REFERENCE RESOLUTION
    # -------------------------------------------------

    def resolve_references(
        self,
        text: str,
        language: str,
    ):
        """
        Conservatively resolves simple references.

        Examples:

            It → the agreement

            Both countries → India and France
        """

        if (
            not text
            or language != "en"
        ):
            return text

        history = list(self.history)

        if not history:
            return text

        current_text = text.strip()

        # ---------------------------------------------
        # 1. RESOLVE AGREEMENT / TREATY / ETC.
        # ---------------------------------------------

        previous = history[-1]["text"]

        candidate = None

        entity_types = [
            "agreement",
            "treaty",
            "decision",
            "proposal",
            "partnership",
            "meeting",
            "summit",
            "declaration",
            "resolution",
        ]

        # Prefer entities explicitly stored in
        # the previous sentence.
        for entity in history[-1].get(
            "entities",
            []
        ):

            if entity["type"] in entity_types:
                candidate = entity["text"]
                break

        # Resolve It / This / That.
        if candidate:

            resolved = re.sub(
                r"^\s*(It|This|That)\b",
                candidate,
                current_text,
                count=1,
                flags=re.IGNORECASE,
            )

            if resolved != current_text:

                print(
                    "🧠 CONTEXT RESOLUTION:"
                )

                print(
                    f"   Previous: {previous}"
                )

                print(
                    f"   Current:  {current_text}"
                )

                print(
                    f"   Resolved: {resolved}"
                )

                current_text = resolved

        # ---------------------------------------------
        # 2. RESOLVE "BOTH COUNTRIES"
        # ---------------------------------------------

        countries = self.get_countries()

        # Only resolve when exactly two countries
        # are available. This avoids guessing.
        if len(countries) == 2:

            country_phrase = (
                f"{countries[0]} and "
                f"{countries[1]}"
            )

            resolved = re.sub(
                r"\bboth countries\b",
                country_phrase,
                current_text,
                count=1,
                flags=re.IGNORECASE,
            )

            if resolved != current_text:

                print(
                    "🧠 ENTITY RESOLUTION:"
                )

                print(
                    f"   Countries: {country_phrase}"
                )

                print(
                    f"   Resolved: {resolved}"
                )

                current_text = resolved

        return current_text

    # -------------------------------------------------
    # CLEAR
    # -------------------------------------------------

    def clear(self):
        self.history.clear()

    def size(self):
        return len(self.history)