type RequestJoinPayload = {
  chamaCode: string;
  fullName: string;
  phone: string;
};

export async function requestJoinChama(payload: RequestJoinPayload) {
  // Backend-ready mock
  return new Promise((resolve) => {
    console.log("Request join payload:", payload);
    setTimeout(resolve, 1000);
  });

  /**
   * REAL API (later)
   *
   * return fetch("/api/chama/request-join", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify(payload),
   * });
   */
}
