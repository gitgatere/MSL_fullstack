import numpy as np


def cosine_similarity(v1, v2):
    keys = set(v1.keys()).union(v2.keys())
    a = np.array([v1.get(k, -120) for k in keys])
    b = np.array([v2.get(k, -120) for k in keys])
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0 or np.isnan(denom):
        return 0.0
    return float(np.dot(a, b) / denom)