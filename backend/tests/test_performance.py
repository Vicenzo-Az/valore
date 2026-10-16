"""
Teste de desempenho — RNF06 (Valore), em pytest.

Verifica se o p95 de cada operação CRUD sobre transações fica abaixo do limite
(padrão 500 ms). Roda contra um servidor REAL (padrão: produção no Heroku) e só
é executado se VALORE_PERF_PASSWORD estiver definida; caso contrário é ignorado,
para que `pytest` normal nunca toque em produção.

Metodologia (idêntica ao relatório original):
  - 1 usuário, requisições sequenciais (concorrência 1)
  - aquecimento descartado + N ciclos medidos
  - cada ciclo: Create -> Read -> Update -> Delete de uma transação de R$ 0,01
  - login fora da medição
  - percentil nearest-rank (para n=10, p95 == máximo)

Uso (PowerShell, dentro de backend/):
    pip install requests
    $env:VALORE_PERF_PASSWORD = "senha"
    pytest tests/test_performance.py -v -s
    pytest tests/test_performance.py -v -s -m performance

Variáveis opcionais:
    VALORE_PERF_URL        (padrão: https://valore-api-279d7c3cc379.herokuapp.com)
    VALORE_PERF_EMAIL      (padrão: pen1@test.com)
    VALORE_PERF_CYCLES     (padrão: 10)
    VALORE_PERF_WARMUP     (padrão: 2)
    VALORE_PERF_THRESHOLD  (padrão: 500, em ms)

Gera tests/performance_result.json como evidência.
Para excluir dos testes normais: pytest -m "not performance"
"""

from __future__ import annotations

import json
import math
import os
import statistics
import time
from datetime import date, datetime
from pathlib import Path
from dotenv import load_dotenv

import pytest
import requests


load_dotenv()


BASE_URL = os.environ.get(
    "VALORE_PERF_URL", "https://valore-api-279d7c3cc379.herokuapp.com").rstrip("/")
EMAIL = os.environ.get("VALORE_PERF_EMAIL", "pen1@test.com")
PASSWORD = os.environ.get("VALORE_PERF_PASSWORD")
CYCLES = int(os.environ.get("VALORE_PERF_CYCLES", "30"))
WARMUP = int(os.environ.get("VALORE_PERF_WARMUP", "5"))
THRESHOLD_MS = float(os.environ.get("VALORE_PERF_THRESHOLD", "500"))
TIMEOUT = 30.0
REPORT_PATH = Path(__file__).parent / "performance_result.json"

OPERATIONS = ("Create", "Read", "Update", "Delete")
EXPECTED_STATUS = {"Create": 201, "Read": 200, "Update": 200, "Delete": 204}

pytestmark = [
    pytest.mark.performance,
    pytest.mark.skipif(
        not PASSWORD, reason="VALORE_PERF_PASSWORD não definida — teste de desempenho ignorado"),
]


def percentile_nearest_rank(values: list[float], p: float) -> float:
    ordered = sorted(values)
    rank = max(1, math.ceil(p / 100 * len(ordered)))
    return ordered[rank - 1]


def _timed(fn):
    start = time.perf_counter()
    resp = fn()
    return resp, (time.perf_counter() - start) * 1000


def _run_cycle(session: requests.Session) -> dict[str, tuple[int, float]]:
    results: dict[str, tuple[int, float]] = {}
    payload = {
        "description": "perf-test RNF06",
        "amount": 0.01,
        "type": "expense",
        "date": date.today().isoformat(),
        "is_recurring": False,
        "is_paid": True,
        "installments": 1,
    }

    r, ms = _timed(lambda: session.post(
        f"{BASE_URL}/transactions/", json=payload, timeout=TIMEOUT))
    results["Create"] = (r.status_code, ms)
    if r.status_code != 201:
        return results
    tx_id = r.json()[0]["id"]

    try:
        r, ms = _timed(lambda: session.get(
            f"{BASE_URL}/transactions/{tx_id}", timeout=TIMEOUT))
        results["Read"] = (r.status_code, ms)

        upd = {**payload, "description": "perf-test RNF06 (editada)"}
        r, ms = _timed(lambda: session.put(
            f"{BASE_URL}/transactions/{tx_id}", json=upd, timeout=TIMEOUT))
        results["Update"] = (r.status_code, ms)
    finally:
        r, ms = _timed(lambda: session.delete(
            f"{BASE_URL}/transactions/{tx_id}", timeout=TIMEOUT))
        results["Delete"] = (r.status_code, ms)

    return results


def _fmt(v: float) -> str:
    return f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


@pytest.fixture(scope="module")
def measurements() -> dict:
    """Faz login, aquece, roda os ciclos uma única vez e devolve as amostras."""
    session = requests.Session()

    t0 = time.perf_counter()
    r = session.post(f"{BASE_URL}/auth/login",
                     json={"email": EMAIL, "password": PASSWORD}, timeout=TIMEOUT)
    login_ms = (time.perf_counter() - t0) * 1000
    assert r.status_code == 200, f"Falha no login ({r.status_code}): {r.text}"

    for _ in range(WARMUP):
        _run_cycle(session)

    samples: dict[str, list[float]] = {op: [] for op in OPERATIONS}
    errors: list[str] = []
    for i in range(1, CYCLES + 1):
        res = _run_cycle(session)
        for op in OPERATIONS:
            if op not in res:
                errors.append(f"ciclo {i}: {op} não executada")
                continue
            status, ms = res[op]
            if status != EXPECTED_STATUS[op]:
                errors.append(
                    f"ciclo {i}: {op} retornou {status} (esperado {EXPECTED_STATUS[op]})")
                continue
            samples[op].append(ms)

    summary = {
        op: {
            "n": len(v),
            "min": round(min(v), 2),
            "mean": round(statistics.mean(v), 2),
            "p50": round(percentile_nearest_rank(v, 50), 2),
            "p95": round(percentile_nearest_rank(v, 95), 2),
            "max": round(max(v), 2),
            "below_threshold": sum(1 for s in v if s < THRESHOLD_MS),
        }
        for op, v in samples.items()
        if v
    }

    report = {
        "requirement": "RNF06",
        "executed_at": datetime.now().isoformat(timespec="seconds"),
        "base_url": BASE_URL,
        "user": EMAIL,
        "cycles": CYCLES,
        "warmup": WARMUP,
        "threshold_ms": THRESHOLD_MS,
        "percentile_method": "nearest-rank",
        "login_ms_not_counted": round(login_ms, 2),
        "results": summary,
        "passed": not errors and all(s["p95"] < THRESHOLD_MS for s in summary.values()) and len(summary) == len(OPERATIONS),
    }
    REPORT_PATH.write_text(json.dumps(
        report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"\n\nRNF06 | {BASE_URL} | {CYCLES} ciclos (+{WARMUP} aquecimento) | limite p95 < {THRESHOLD_MS:.0f} ms")
    print(f"{'Operação':<10}{'min':>11}{'p50':>11}{'p95':>11}{'max':>11}  (ms)")
    for op, s in summary.items():
        print(
            f"{op:<10}{_fmt(s['min']):>11}{_fmt(s['p50']):>11}{_fmt(s['p95']):>11}{_fmt(s['max']):>11}")
    print(f"Evidência salva em {REPORT_PATH}\n")

    return {"summary": summary, "errors": errors}


def test_respostas_com_status_esperado(measurements):
    """Respostas inesperadas (ex.: 401, 500) invalidam a medição."""
    assert not measurements["errors"], "\n".join(measurements["errors"])


@pytest.mark.parametrize("operation", OPERATIONS)
def test_rnf06_p95_abaixo_do_limite(measurements, operation):
    stats = measurements["summary"].get(operation)
    assert stats, f"Sem amostras válidas para {operation}"
    assert stats["p95"] < THRESHOLD_MS, (
        f"{operation}: p95 = {stats['p95']} ms (limite {THRESHOLD_MS:.0f} ms)"
    )
