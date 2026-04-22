function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of unvisited) {
    distances[node] = node === start ? 0 : Infinity;
    previous[node] = null;
  }

  while (unvisited.size) {
    let currentNode = null;

    for (const node of unvisited) {
      if (currentNode === null || distances[node] < distances[currentNode]) {
        currentNode = node;
      }
    }

    if (currentNode === null || distances[currentNode] === Infinity) {
      break;
    }

    if (currentNode === end) {
      break;
    }

    unvisited.delete(currentNode);

    for (const neighbor of graph[currentNode] || []) {
      const alternativeDistance = distances[currentNode] + neighbor.weight;

      if (alternativeDistance < distances[neighbor.node]) {
        distances[neighbor.node] = alternativeDistance;
        previous[neighbor.node] = currentNode;
      }
    }
  }

  const path = [];
  let cursor = end;

  while (cursor) {
    path.unshift(cursor);
    cursor = previous[cursor];
  }

  return {
    distance: distances[end] === Infinity ? null : distances[end],
    path: path[0] === start ? path : []
  };
}

module.exports = dijkstra;
