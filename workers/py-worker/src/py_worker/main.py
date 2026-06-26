from __future__ import annotations


def generate_embedding_stub(text: str) -> list[float]:
    """Return a deterministic tiny vector until real embedding generation exists."""
    if not text:
        return [0.0, 0.0, 0.0]

    total = sum(ord(character) for character in text)
    return [
        float(total % 101) / 100.0,
        float(len(text) % 101) / 100.0,
        float(ord(text[0]) % 101) / 100.0,
    ]


def rank_recommendations_stub(
    query_vector: list[float], candidates: list[dict]
) -> list[dict]:
    """Return candidates unchanged with placeholder ranks for future ranking work."""
    _ = query_vector
    return [{**candidate, "rank": index + 1} for index, candidate in enumerate(candidates)]


if __name__ == "__main__":
    print(generate_embedding_stub("placeholder music query"))
