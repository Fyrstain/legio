// Returns unique expression options found in EV.characteristic[].definitionExpression
export function readExpressionOptionsFromEV(ev: any): Array<{ label: string; value: string }> {
  const set = new Set<string>();
  ev?.characteristic?.forEach((c: any) => {
    const def = c?.definitionExpression;
    if (!def) return;
    // Prefer explicit name; otherwise use 'expression'
    if (def.name) set.add(def.name);
    else if (def.expression) set.add(def.expression);
  });
  return Array.from(set).map((x) => ({ label: x, value: x }));
}

