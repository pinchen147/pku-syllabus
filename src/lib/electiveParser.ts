import type { CourseWithSkip } from '../types';

const SCHEDULE_RE = /^(\d+)~(\d+)周 (.)周周(.)(\d+)~(\d+)节\s*(.*)$/;
const EVERY_MAP: Record<string, 'all' | 'odd' | 'even'> = {
  '每': 'all',
  '单': 'odd',
  '双': 'even',
};
const WEEKDAY_STR = '啊一二三四五六日';

interface ParseResult {
  courses: CourseWithSkip[];
  skippedIndices: number[];
}

function parseScheduleStr(
  infostr: string,
  name: string,
  desc: string,
  idx: number,
): CourseWithSkip | null {
  const res = SCHEDULE_RE.exec(infostr);
  if (!res) return null;

  const [, begin_week, end_week, every_str, week_str, begin_time, end_time, classroom] = res;
  return {
    course_name: name,
    begin_week: parseInt(begin_week),
    end_week: parseInt(end_week),
    every: EVERY_MAP[every_str] ?? 'all',
    weekday: WEEKDAY_STR.indexOf(week_str),
    begin_time: parseInt(begin_time),
    end_time: parseInt(end_time),
    classroom: classroom,
    desc,
    _skip_idx: idx,
  };
}

function buildDesc(
  cells: NodeListOf<Element> | Element[],
  col: Record<string, number>,
  descChecked: string[],
): string {
  const items: string[] = [];
  if (descChecked.includes('教师') && cells[col.teacher - 1])
    items.push(
      cells[col.teacher - 1].textContent!
        .replace(/[,，、].+$/, '等')
        .replace(/\(.+\)/, ''),
    );
  if (descChecked.includes('班号') && cells[col.classId - 1])
    items.push(cells[col.classId - 1].textContent! + '班');
  if (descChecked.includes('课程类别') && cells[col.type - 1])
    items.push(cells[col.type - 1].textContent!);
  if (descChecked.includes('学分') && cells[col.credits - 1])
    items.push(cells[col.credits - 1].textContent!.replace(/\.0$/, '') + '学分');
  return items.join('，');
}

function buildColMap(headers: string[]): Record<string, number> {
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    colMap[h] = i + 1;
  }); // 1-based for nth-child compatibility
  return {
    name: colMap['课程名'] || 2,
    type: colMap['课程类别'] || 3,
    credits: colMap['学分'] || 4,
    teacher: colMap['教师'] || 6,
    classId: colMap['班号'] || 7,
    info: colMap['教室信息'] || 9,
    status: colMap['选课结果'] || 10,
  };
}

export function parseHtml(target: HTMLElement, descChecked: string[]): ParseResult | null {
  const table =
    target.querySelector('.datagrid') || target.querySelector('table');
  if (!table) return null;

  // Find headers
  let headerCells = table.querySelectorAll('.datagrid-header th');
  if (headerCells.length === 0) headerCells = table.querySelectorAll('thead th');
  if (headerCells.length === 0) {
    const firstRow = table.querySelector('tr');
    if (firstRow) headerCells = firstRow.querySelectorAll('th, td');
  }
  const headers = Array.from(headerCells).map((th) => th.textContent!.trim());
  const col = buildColMap(headers);

  // Find data rows
  let rows = table.querySelectorAll('.datagrid-even, .datagrid-odd, .datagrid-all');
  if (rows.length === 0) rows = table.querySelectorAll('tbody tr');
  if (rows.length === 0) {
    const allRows = Array.from(table.querySelectorAll('tr'));
    if (allRows.length > 1) rows = allRows.slice(1) as unknown as NodeListOf<Element>;
  }

  const skipIndices: number[] = [];
  const courses: CourseWithSkip[] = [];

  Array.from(rows).forEach((row, idx) => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return;

    const name = (cells[col.name - 1] || cells[0]).textContent!;

    let infoElem: Element | null = cells[col.info - 1] ?? null;
    if (!infoElem) return;
    if (infoElem.querySelector('span')) infoElem = infoElem.querySelector('span')!;

    const infos = Array.from(infoElem.childNodes)
      .filter((node) => node.nodeName.toLowerCase() === '#text')
      .map((node) => node.textContent!);

    const statusElem = cells[col.status - 1];
    const status = statusElem ? statusElem.textContent! : '?';

    if (status === '未选上' || status === '已退选') skipIndices.push(idx);

    const desc = buildDesc(cells, col, descChecked);

    infos.forEach((infostr) => {
      const c = parseScheduleStr(infostr, name, desc, idx);
      if (c) courses.push(c);
    });
  });

  if (courses.length === 0) return null;
  return { courses, skippedIndices: skipIndices };
}

export function parseTsv(text: string, descChecked: string[]): ParseResult | null {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));

  // Find the header row: first line with tabs
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('\t')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return null;

  const headerFields = lines[headerIdx].split('\t').map((h) => h.trim());
  const expectedTabCount = headerFields.length - 1;
  if (expectedTabCount < 3) return null;

  // Build column map dynamically
  const colIdx: Record<string, number> = {};
  headerFields.forEach((h, i) => {
    colIdx[h] = i;
  });

  const nameIdx = colIdx['课程名'] ?? -1;
  const typeIdx = colIdx['课程类别'] ?? -1;
  const creditsIdx = colIdx['学分'] ?? -1;
  const teacherIdx = colIdx['教师'] ?? -1;
  const classIdIdx = colIdx['班号'] ?? -1;
  const infoIdx = colIdx['教室信息'] ?? -1;
  const statusIdx = colIdx['选课结果'] ?? -1;

  if (nameIdx === -1 || infoIdx === -1) return null;

  // Merge continuation lines: lines with fewer tabs are appended to previous row's info field
  interface RawRow {
    fields: string[];
    rowIdx: number;
  }
  const dataRows: RawRow[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const tabCount = (line.match(/\t/g) || []).length;
    if (tabCount >= expectedTabCount) {
      // Full row
      dataRows.push({ fields: line.split('\t'), rowIdx: dataRows.length });
    } else if (dataRows.length > 0 && infoIdx >= 0) {
      // Continuation line: append to previous row's info field
      dataRows[dataRows.length - 1].fields[infoIdx] += '\n' + line;
    }
  }

  const skipIndices: number[] = [];
  const courses: CourseWithSkip[] = [];

  dataRows.forEach(({ fields, rowIdx }) => {
    const name = (fields[nameIdx] ?? '').trim();
    if (!name) return;

    const status = statusIdx >= 0 ? (fields[statusIdx] ?? '').trim() : '';
    if (status === '未选上' || status === '已退选') skipIndices.push(rowIdx);

    // Build description
    const descItems: string[] = [];
    if (descChecked.includes('教师') && teacherIdx >= 0 && fields[teacherIdx])
      descItems.push(
        fields[teacherIdx]
          .trim()
          .replace(/[,，、].+$/, '等')
          .replace(/\(.+\)/, ''),
      );
    if (descChecked.includes('班号') && classIdIdx >= 0 && fields[classIdIdx])
      descItems.push(fields[classIdIdx].trim() + '班');
    if (descChecked.includes('课程类别') && typeIdx >= 0 && fields[typeIdx])
      descItems.push(fields[typeIdx].trim());
    if (descChecked.includes('学分') && creditsIdx >= 0 && fields[creditsIdx])
      descItems.push(fields[creditsIdx].trim().replace(/\.0$/, '') + '学分');
    const desc = descItems.join('，');

    // Parse info field: may contain multiple schedule lines
    const infoStr = fields[infoIdx] ?? '';
    const infoLines = infoStr.split('\n');
    infoLines.forEach((infoLine) => {
      const c = parseScheduleStr(infoLine.trim(), name, desc, rowIdx);
      if (c) courses.push(c);
    });
  });

  if (courses.length === 0) return null;
  return { courses, skippedIndices: skipIndices };
}
