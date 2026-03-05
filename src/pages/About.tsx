import { TopBar } from '../components/TopBar';
import figure from '../assets/figure.png';
import './About.css';

export function About() {
  return (
    <div>
      <TopBar title="关于" />
      <div className="about-content">
        <div className="about-card">
          <p>
            本工具可从选课系统 <del style={{ opacity: 0.6 }}>或 ISOP</del>{' '}
            加载学期课表，进行编辑后生成通用的 iCalendar (.ICS) 日历文件，以方便查看。
          </p>
          <img src={figure} className="about-figure" alt="figure" />
          <p>由于不同软件对 iCalendar 日历的支持情况不同，生成的日历可能与校历有所偏差，请仔细核对后使用。</p>
          <p>
            基于&nbsp;
            <a href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html" target="_blank" rel="noopener noreferrer">
              GPLv3
            </a>
            &nbsp;协议在{' '}
            <a href="https://github.com/pinchen147/pku-syllabus" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>{' '}
            开源。
          </p>
          <p className="about-disclaimer">
            This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
            without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
            {' '}See the&nbsp;
            <a href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html" target="_blank" rel="noopener noreferrer">
              GNU General Public License
            </a>
            &nbsp;for more details.
          </p>
          <p className="about-credit">课表助手 by @xmcp modernized by @pinchen147</p>
        </div>
      </div>
    </div>
  );
}
