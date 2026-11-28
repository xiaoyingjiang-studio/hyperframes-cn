function elementChildren(node, tagName) {
  return node.children.filter(child => child.type === 'element' && (!tagName || child.tagName === tagName));
}

function plainText(node) {
  return node.type === 'text' ? node.value : (node.children ?? []).map(plainText).join('');
}

function labelTable(node) {
  if (node.type !== 'element' || node.tagName !== 'table') {
    node.children?.forEach(labelTable);
    return;
  }
  const head = elementChildren(node, 'thead')[0];
  const headRow = head && elementChildren(head, 'tr')[0];
  if (!headRow) return;
  const columns = elementChildren(headRow, 'th');
  const labels = columns.map(plainText);
  node.properties.role = 'table';
  head.properties.role = 'rowgroup';
  headRow.properties.role = 'row';
  for (const column of columns) Object.assign(column.properties, { scope: 'col', role: 'columnheader' });

  for (const body of elementChildren(node, 'tbody')) {
    body.properties.role = 'rowgroup';
    for (const row of elementChildren(body, 'tr')) {
      row.properties.role = 'row';
      elementChildren(row, 'td').forEach((cell, index) => {
        if (index === 0) {
          cell.tagName = 'th';
          Object.assign(cell.properties, { scope: 'row', role: 'rowheader' });
          return;
        }
        cell.properties.role = 'cell';
        if (!labels[index]) return;
        cell.children.unshift({
          type: 'element',
          tagName: 'span',
          properties: { className: ['guide-cell-label'], ariaHidden: 'true', dataPagefindIgnore: '' },
          children: [{ type: 'text', value: labels[index] }],
        });
      });
    }
  }
}

export default function guideTables() {
  return labelTable;
}
