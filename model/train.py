"""Train and export Voixta's browser classifier. Requires scikit-learn."""
import csv
import io
import json
import re
import unicodedata
from pathlib import Path
from urllib.request import urlopen

from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split

SOURCE = (
    "https://huggingface.co/datasets/Ridham115/indian-scam-sms-synthetic-audited/"
    "resolve/45e92c38ba20e973ef3ff5d1893a0a710f622018/data/synthetic_audited.csv"
)
LANGUAGES = {"en", "hi", "hinglish"}
ROOT = Path(__file__).resolve().parents[1]


def features(message):
    text = unicodedata.normalize("NFKC", message).lower()
    text = re.sub(r"(?:https?://|www\.)\S+", " urltoken ", text)
    text = "".join(
        ch if unicodedata.category(ch)[0] in "LM" else "0" if ch.isdecimal() else " "
        for ch in text
    )
    tokens = re.sub(r"0+", "0", text).split()
    terms = set(tokens)
    terms.update(f"{first} {second}" for first, second in zip(tokens, tokens[1:]))
    for token in tokens:
        word = f"^{token}$"
        for length in (3, 4):
            terms.update("~" + word[i : i + length] for i in range(len(word) - length + 1))
    return dict.fromkeys(terms, 1)


def fit(rows):
    vectorizer = DictVectorizer()
    inputs = vectorizer.fit_transform(features(text) for text, _ in rows)
    labels = [label for _, label in rows]
    model = LogisticRegression(C=0.35, max_iter=1000).fit(inputs, labels)
    names = vectorizer.get_feature_names_out()
    retained = sorted(zip(names, model.coef_[0]), key=lambda pair: -abs(pair[1]))[:9000]
    return float(model.intercept_[0]), {name: round(float(weight), 5) for name, weight in retained}


def classify(text, bias, weights):
    score = bias + sum(weights.get(term, 0.0) for term in features(text))
    return score >= 0


def main():
    with urlopen(SOURCE) as response:
        data = csv.DictReader(io.StringIO(response.read().decode("utf-8-sig")))
        rows = {
            unicodedata.normalize("NFKC", row["text"]).strip(): int(row["label"] == "scam")
            for row in data
            if row["language"] in LANGUAGES
        }
    rows = sorted(rows.items())
    train, test = train_test_split(rows, test_size=0.25, random_state=31, stratify=[r[1] for r in rows])
    bias, weights = fit(train)
    report = confusion_matrix([label for _, label in test],
                              [classify(text, bias, weights) for text, _ in test]).tolist()
    print(f"Synthetic SMS holdout: {len(train)} train / {len(test)} test, [[TN, FP], [FN, TP]]={report}")
    bias, weights = fit(rows)
    output = ROOT / "public" / "detector-model.json"
    output.write_text(json.dumps({"bias": round(bias, 5), "weights": weights},
                                 ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Exported {len(weights)} weights from {len(rows)} examples ({output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
