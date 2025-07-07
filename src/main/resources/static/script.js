window.addEventListener('DOMContentLoaded', function () {
  let personMap = {};
  let renderedIds = new Set();

  async function loadTree() {
    const response = await fetch('http://localhost:8080/api/persons');
    const persons = await response.json();

    personMap = {};
    renderedIds.clear();

    persons.forEach(p => {
      personMap[p.id] = { ...p };
    });

    const couples = findCouples(persons);
    const parentChildMap = buildParentChildMap(couples);
    const rootCouples = findRootCouples(couples);

    // Get single root-level people not in any couple and not parents of any child
    const coupleParentIds = new Set(rootCouples.flatMap(c => c.parents.map(p => p.id)));
    const allCoupleParentIds = new Set(couples.flatMap(c => c.parents.map(p => p.id)));
    const singles = persons.filter(p =>
      (!p.parents || p.parents.length === 0) &&
      !coupleParentIds.has(p.id) &&
      !allCoupleParentIds.has(p.id)
    );

    const treeContainer = document.getElementById('tree');
    treeContainer.innerHTML = `<ul>
      ${rootCouples.map(c => renderCouple(c, parentChildMap)).join('')}
      ${singles.map(s => renderSinglePerson(s)).join('')}
    </ul>`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawLines(couples);
      });
    });
  }

  function findCouples(persons) {
    const coupleMap = new Map();
    persons.forEach(child => {
      if (child.parents && child.parents.length === 2) {
        const ids = [child.parents[0].id, child.parents[1].id].sort();
        const key = ids.join('-');
        if (!coupleMap.has(key)) coupleMap.set(key, { parents: ids.map(id => personMap[id]), children: [] });
        coupleMap.get(key).children.push(child.id);
      }
    });
    return Array.from(coupleMap.values());
  }

  function buildParentChildMap(couples) {
    const map = {};
    couples.forEach(c => {
      const key = `${c.parents[0].id}-${c.parents[1].id}`;
      map[key] = c.children;
    });
    return map;
  }

  function findRootCouples(couples) {
    const childIds = new Set(couples.flatMap(c => c.children));
    return couples.filter(c => !childIds.has(c.parents[0].id) && !childIds.has(c.parents[1].id));
  }

  function renderCouple(couple, parentChildMap) {
    const [p1, p2] = couple.parents;
    const key = `${p1.id}-${p2.id}`;
    renderedIds.add(key);
    renderedIds.add(p1.id);
    renderedIds.add(p2.id);

    return `
      <li>
        <div class="partner-group" data-couple="${key}">
          <div class="node" data-id="${p1.id}">
            ${p1.name} (ID: ${p1.id})<br>${formatDate(p1.birthdate)}
            <button onclick="deletePerson(${p1.id})">Delete</button>
          </div>
          <span class="dash">—</span>
          <div class="node" data-id="${p2.id}">
            ${p2.name} (ID: ${p2.id})<br>${formatDate(p2.birthdate)}
            <button onclick="deletePerson(${p2.id})">Delete</button>
          </div>
        </div>
        <div id="children-${key}"></div>
        ${shouldShowExpandButton(key) ? `<button class="expand-btn" onclick="expandCouple('${key}')">Expand</button>` : ''}
      </li>
    `;
  }

  function renderSinglePerson(person) {
    if (renderedIds.has(person.id)) return '';
    renderedIds.add(person.id);
    return `
      <li>
        <div class="node" data-id="${person.id}">
          ${person.name} (ID: ${person.id})<br>${formatDate(person.birthdate)}
          <button onclick="deletePerson(${person.id})">Delete</button>
        </div>
      </li>
    `;
  }

  function shouldShowExpandButton(coupleKey) {
    const [id1, id2] = coupleKey.split('-').map(Number);
    for (const p of Object.values(personMap)) {
      if (p.parents && p.parents.length === 2) {
        const ids = [p.parents[0].id, p.parents[1].id].sort();
        if (ids[0] === id1 && ids[1] === id2) {
          if (!renderedIds.has(p.id)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  window.expandCouple = function (coupleKey) {
    const [id1, id2] = coupleKey.split('-').map(Number);
    const children = [];

    for (const p of Object.values(personMap)) {
      if (p.parents && p.parents.length === 2) {
        const ids = [p.parents[0].id, p.parents[1].id].sort();
        if (ids[0] === id1 && ids[1] === id2) {
          children.push(p);
        }
      }
    }

    const html = children.map(child => {
      const couple = findCoupleByParent(child.id);
      if (couple) {
        const coupleKey = `${couple.parents[0].id}-${couple.parents[1].id}`;
        if (renderedIds.has(coupleKey)) return '';
        return renderCouple(couple, {}, 1);
      } else if (!renderedIds.has(child.id)) {
        renderedIds.add(child.id);
        return `
          <li>
            <div class="node" data-id="${child.id}">
              ${child.name} (ID: ${child.id})<br>${formatDate(child.birthdate)}
              <button onclick="deletePerson(${child.id})">Delete</button>
            </div>
          </li>
        `;
      }
      return '';
    }).join('');

    const container = document.getElementById(`children-${coupleKey}`);
    container.innerHTML = `<ul>${html}</ul>`;
    const btn = document.querySelector(`button.expand-btn[onclick="expandCouple('${coupleKey}')"]`);
    if (btn) btn.remove();
    drawLines(findCouples(Object.values(personMap)));
  };

  function findCoupleByParent(parentId) {
    return findCouples(Object.values(personMap)).find(c =>
      c.parents.some(p => p.id === parentId)
    );
  }

  function drawLines(couples) {
    const svg = document.getElementById("lines");
    svg.innerHTML = '';

    couples.forEach(({ parents, children }) => {
      const groupEl = document.querySelector(`.partner-group[data-couple='${parents[0].id}-${parents[1].id}']`);
      if (!groupEl) return;

      const groupBox = groupEl.getBoundingClientRect();
      const centerX = groupBox.left + groupBox.width / 2;
      const topY = groupBox.bottom;

      children.forEach(childId => {
        const childEl = document.querySelector(`.node[data-id='${childId}']`);
        if (!childEl) return;

        const childBox = childEl.getBoundingClientRect();
        const childX = childBox.left + childBox.width / 2;
        const childY = childBox.top;

        const svgBox = svg.getBoundingClientRect();

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", centerX - svgBox.left);
        line.setAttribute("y1", topY - svgBox.top);
        line.setAttribute("x2", childX - svgBox.left);
        line.setAttribute("y2", childY - svgBox.top);
        line.setAttribute("stroke", "#555");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
      });
    });
  }

  function formatDate(isoDate) {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-GB');
  }

  window.deletePerson = async function (id) {
    if (confirm("Are you sure you want to delete this person?")) {
      await fetch(`http://localhost:8080/api/persons/${id}`, { method: 'DELETE' });
      renderedIds.clear();
      loadTree();
    }
  };

  document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const parentIds = document.getElementById('parentIds').value
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    const res = await fetch('http://localhost:8080/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person: { name, birthdate }, parentIds })
    });

    if (res.ok) {
      document.getElementById('addForm').reset();
      renderedIds.clear();
      loadTree();
    } else {
      alert('Failed to add person');
    }
  });

  loadTree();
});
