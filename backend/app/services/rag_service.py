from pathlib import Path
import re

from app.config import BASE_DIR


KB_DIR = (
    BASE_DIR
    /
    "data"
    /
    "knowledge_base"
)


def load_documents():

    KB_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    documents = []

    for path in KB_DIR.glob("**/*"):

        if (
            path.is_file()
            and
            path.suffix.lower()
            in [".txt", ".md"]
        ):

            documents.append({
                "file": path.name,
                "content":
                    path.read_text(
                        errors="ignore"
                    )
            })

    return documents


def retrieve(
    query,
    top_k=4
):

    query_words = set(
        re.findall(
            r"\w+",
            query.lower()
        )
    )

    scored = []

    for document in load_documents():

        document_words = set(
            re.findall(
                r"\w+",
                document["content"].lower()
            )
        )

        score = len(
            query_words
            &
            document_words
        )

        if score > 0:

            scored.append({
                "score": score,
                "file": document["file"],
                "content":
                    document["content"][:2000]
            })

    scored.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return scored[:top_k]


def answer(query):

    results = retrieve(query)

    if not results:

        return {
            "answer":
                "No matching operational guidance was found.",
            "sources": []
        }

    context = "\n\n".join(
        item["content"]
        for item in results
    )

    return {
        "answer":
            "Relevant RESQ-OPS operational guidance:\n\n"
            +
            context[:5000],

        "sources": [
            {
                "file": item["file"],
                "score": item["score"]
            }
            for item in results
        ]
    }