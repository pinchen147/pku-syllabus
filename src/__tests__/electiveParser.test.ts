import { describe, it, expect } from 'vitest';
import { parseHtml, parseTsv } from '../lib/electiveParser';

describe('parseHtml', () => {
  it('parses a standard table', () => {
    const html = `
      <table>
        <thead><tr>
          <th>序号</th><th>课程名</th><th>课程类别</th><th>学分</th><th>周学时</th>
          <th>教师</th><th>班号</th><th>限数</th><th>教室信息</th><th>选课结果</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>1</td><td>高等数学</td><td>必修</td><td>4.0</td><td>4</td>
            <td>张三</td><td>01</td><td>120</td>
            <td>1~16周 每周周二1~2节 理教306</td>
            <td>已选上</td>
          </tr>
        </tbody>
      </table>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;

    const result = parseHtml(container, ['教师', '班号']);
    expect(result).not.toBeNull();
    expect(result!.courses).toHaveLength(1);
    expect(result!.courses[0].course_name).toBe('高等数学');
    expect(result!.courses[0].begin_week).toBe(1);
    expect(result!.courses[0].end_week).toBe(16);
    expect(result!.courses[0].every).toBe('all');
    expect(result!.courses[0].weekday).toBe(2);
    expect(result!.courses[0].begin_time).toBe(1);
    expect(result!.courses[0].end_time).toBe(2);
    expect(result!.courses[0].classroom).toBe('理教306');
    expect(result!.courses[0].desc).toBe('张三，01班');
  });

  it('skips courses with 已退选 status', () => {
    const html = `
      <table>
        <thead><tr>
          <th>序号</th><th>课程名</th><th>课程类别</th><th>学分</th><th>周学时</th>
          <th>教师</th><th>班号</th><th>限数</th><th>教室信息</th><th>选课结果</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>1</td><td>线性代数</td><td>必修</td><td>3.0</td><td>3</td>
            <td>李四</td><td>02</td><td>100</td>
            <td>1~16周 每周周三3~4节 理教205</td>
            <td>已退选</td>
          </tr>
        </tbody>
      </table>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;

    const result = parseHtml(container, []);
    expect(result).not.toBeNull();
    expect(result!.skippedIndices).toContain(0);
  });

  it('skips courses with 未选上 status', () => {
    const html = `
      <table>
        <thead><tr>
          <th>序号</th><th>课程名</th><th>课程类别</th><th>学分</th><th>周学时</th>
          <th>教师</th><th>班号</th><th>限数</th><th>教室信息</th><th>选课结果</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>1</td><td>概率论</td><td>必修</td><td>3.0</td><td>3</td>
            <td>王五</td><td>01</td><td>80</td>
            <td>1~16周 单周周四5~6节 理教101</td>
            <td>未选上</td>
          </tr>
        </tbody>
      </table>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;

    const result = parseHtml(container, []);
    expect(result).not.toBeNull();
    expect(result!.skippedIndices).toContain(0);
  });

  it('returns null when no table found', () => {
    const container = document.createElement('div');
    container.innerHTML = '<p>No table here</p>';
    expect(parseHtml(container, [])).toBeNull();
  });

  it('handles odd/even week courses', () => {
    const html = `
      <table>
        <thead><tr>
          <th>序号</th><th>课程名</th><th>课程类别</th><th>学分</th><th>周学时</th>
          <th>教师</th><th>班号</th><th>限数</th><th>教室信息</th><th>选课结果</th>
        </tr></thead>
        <tbody>
          <tr>
            <td>1</td><td>实验课</td><td>必修</td><td>2.0</td><td>2</td>
            <td>赵六</td><td>01</td><td>30</td>
            <td>1~15周 单周周五7~8节 实验楼201</td>
            <td>已选上</td>
          </tr>
          <tr>
            <td>2</td><td>讨论课</td><td>选修</td><td>1.0</td><td>1</td>
            <td>钱七</td><td>01</td><td>20</td>
            <td>2~16周 双周周六3~4节 文史楼101</td>
            <td>已选上</td>
          </tr>
        </tbody>
      </table>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;

    const result = parseHtml(container, []);
    expect(result).not.toBeNull();
    expect(result!.courses).toHaveLength(2);
    expect(result!.courses[0].every).toBe('odd');
    expect(result!.courses[1].every).toBe('even');
  });
});

describe('parseTsv', () => {
  it('parses tab-separated text', () => {
    const tsv = [
      '序号\t课程名\t课程类别\t学分\t周学时\t教师\t班号\t限数\t教室信息\t选课结果',
      '1\t高等数学\t必修\t4.0\t4\t张三\t01\t120\t1~16周 每周周二1~2节 理教306\t已选上',
    ].join('\n');

    const result = parseTsv(tsv, ['教师', '班号']);
    expect(result).not.toBeNull();
    expect(result!.courses).toHaveLength(1);
    expect(result!.courses[0].course_name).toBe('高等数学');
    expect(result!.courses[0].classroom).toBe('理教306');
    expect(result!.courses[0].desc).toBe('张三，01班');
  });

  it('handles multi-line info cells (continuation lines)', () => {
    const tsv = [
      '序号\t课程名\t课程类别\t学分\t周学时\t教师\t班号\t限数\t教室信息\t选课结果',
      '1\t高等数学\t必修\t4.0\t4\t张三\t01\t120\t1~16周 每周周二1~2节 理教306\t已选上',
      '1~16周 每周周四3~4节 理教306',
    ].join('\n');

    const result = parseTsv(tsv, []);
    expect(result).not.toBeNull();
    expect(result!.courses).toHaveLength(2);
    expect(result!.courses[0].weekday).toBe(2);
    expect(result!.courses[1].weekday).toBe(4);
  });

  it('skips 已退选 and 未选上', () => {
    const tsv = [
      '序号\t课程名\t课程类别\t学分\t周学时\t教师\t班号\t限数\t教室信息\t选课结果',
      '1\t线性代数\t必修\t3.0\t3\t李四\t02\t100\t1~16周 每周周三3~4节 理教205\t已退选',
      '2\t概率论\t必修\t3.0\t3\t王五\t01\t80\t1~16周 每周周四5~6节 理教101\t未选上',
    ].join('\n');

    const result = parseTsv(tsv, []);
    expect(result).not.toBeNull();
    expect(result!.skippedIndices).toContain(0);
    expect(result!.skippedIndices).toContain(1);
  });

  it('returns null when no tabs found', () => {
    expect(parseTsv('no tabs here', [])).toBeNull();
  });

  it('returns null when required columns are missing', () => {
    expect(parseTsv('Col1\tCol2\tCol3', [])).toBeNull();
  });

  it('builds description with selected fields', () => {
    const tsv = [
      '序号\t课程名\t课程类别\t学分\t周学时\t教师\t班号\t限数\t教室信息\t选课结果',
      '1\t数学分析\t必修\t5.0\t5\t陈教授\t03\t150\t1~16周 每周周一1~2节 理教401\t已选上',
    ].join('\n');

    const result = parseTsv(tsv, ['教师', '学分']);
    expect(result).not.toBeNull();
    expect(result!.courses[0].desc).toBe('陈教授，5学分');
  });
});
