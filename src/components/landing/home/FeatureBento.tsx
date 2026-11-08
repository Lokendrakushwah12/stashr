"use client";

import { useTheme } from "next-themes";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Avatar,
  Bar,
  BrandMark,
  Button,
  Collapse,
  Facepile,
  Field,
  Icon,
  Kbd,
  Stage,
  Text,
} from "@/components/landing/stageshow/kit";
import type { Act } from "@/components/landing/stageshow/kit";
import "./feature-bento.css";

// Stashr's features section, built from examples/bento.
//
//   Tile       Span   Kind       The one thing                         Moves
//   Links      2 × 1  Hero UI    a note whose links read as chips      the third item lands, carrying nothing below
//   Write      1 × 1  Statement  the two shortcuts, on the dark tile   ⌘↵ presses once
//   Team       1 × 1  Component  an invite, Editor, Invite             Invite turns Invited
//   Boards     1 × 1  Object     a stack of board folders              the top folder settles
//   Activity   1 × 1  Component  who did what, newest first            a new row arrives on top
//
// No window chrome anywhere: the hero is the note card itself. Neighbors
// alternate kinds across and down. Each picture is its own Stage at 1:1,
// pinned to the tile's bottom; copy is page text. One beat per tile, once,
// 110ms apart in reading order.

const STEP = 110;
const LEAD = 450;

// The page's theme, for every stage but the always-dark Write tile.
const PageTheme = createContext<"light" | "dark">("light");

type Beat = { on: boolean };
const before: Beat = { on: false };
const after: Beat = { on: true };
const beat = (i: number) => async (a: Act<Beat>) => {
  await a.wait(LEAD + i * STEP);
  await a.set({ on: true });
};

function Tile({
  area,
  title,
  children,
  picture,
  dark,
}: {
  area: string;
  title: ReactNode;
  children?: ReactNode;
  picture?: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`sb-tile sb-tile--${area}`}
      data-dark={dark || undefined}
      data-crop
    >
      <p className="sb-copy">
        {title} {children}
      </p>
      {picture}
    </section>
  );
}

function usePictureWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () =>
      setWidth(Math.max(1, node.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/* ---------------- Links (hero) ---------------- */

type Link = {
  label: string;
  brand: "figma" | "github" | "notion";
  url: string;
};
const LINKS: Link[] = [
  { label: "Moodboard", brand: "figma", url: "figma.com/file/moodboard" },
  { label: "Landing repo", brand: "github", url: "github.com/stashr/web" },
  { label: "Launch notes", brand: "notion", url: "notion.so/launch-notes" },
];

function Chip({ link }: { link: Link }) {
  return (
    <span className="sb-chip">
      <BrandMark brand={link.brand} size={14} tile={false} />
      <Text className="sb-chip-url">{link.url}</Text>
    </span>
  );
}

function Note({ on }: { on: boolean }) {
  return (
    <div className="sb-timeline">
      <div className="sb-note">
        <div className="sb-note-head">
          <Avatar name="Lokendra" size={22} />
          <Text className="sb-note-name">Lokendra</Text>
          <Bar w={34} h={6} tone={2} />
        </div>
        <ol className="sb-list">
          {LINKS.slice(0, 2).map((link, i) => (
            <li key={link.url} className="sb-item">
              <span className="sb-num">{i + 1}.</span>
              <Text>{`${link.label}:`}</Text>
              <Chip link={link} />
            </li>
          ))}
          <Collapse open={on}>
            <li className="sb-item">
              <span className="sb-num">3.</span>
              <Text>{`${LINKS[2]!.label}:`}</Text>
              <Chip link={LINKS[2]!} />
            </li>
          </Collapse>
        </ol>
      </div>
      <div className="sb-note sb-note--next" aria-hidden>
        <div className="sb-note-head">
          <Bar w={22} h={22} r={11} tone={2} />
          <Bar w={70} h={7} tone={3} />
          <Bar w={34} h={6} tone={2} />
        </div>
        <Bar w={240} h={6} tone={2} />
      </div>
    </div>
  );
}

function Links() {
  const theme = useContext(PageTheme);
  const [picture, width] = usePictureWidth();
  return (
    <Tile
      area="hero"
      title={<b>Every link, readable.</b>}
      picture={
        <div ref={picture} className="sb-picture sb-picture--full">
          <Stage<Beat>
            width={width}
            height={300}
            initial={before}
            poster={after}
            play="once"
            script={beat(0)}
            theme={theme}
            className="sb-stage"
          >
            {(s) => <Note on={s.on} />}
          </Stage>
        </div>
      }
    >
      Paste a URL and it becomes a chip with the site&rsquo;s logo, not a wall
      of text.
    </Tile>
  );
}

/* ---------------- Write (statement, dark) ---------------- */

function Write() {
  return (
    <Tile
      area="write"
      dark
      title={<b>Write like you chat.</b>}
      picture={
        <div className="sb-picture sb-picture--small">
          <Stage<Beat>
            width={360}
            height={260}
            initial={before}
            poster={after}
            play="once"
            script={beat(1)}
            theme="dark"
            className="sb-stage"
          >
            {(s) => (
              <div className="sb-keys">
                <div className="sb-key-row">
                  <Kbd keys={["⇧", "↵"]} />
                  <Text className="sb-key-label">New line</Text>
                </div>
                <div className="sb-key-row" data-on={s.on || undefined}>
                  <Kbd keys={["⌘", "↵"]} className="sb-kbd-send" />
                  <Text className="sb-key-label">Post</Text>
                </div>
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Lists, checklists and links format as you type.
    </Tile>
  );
}

/* ---------------- Team (component) ---------------- */

function Team() {
  const theme = useContext(PageTheme);
  const [picture, width] = usePictureWidth();
  return (
    <Tile
      area="team"
      title={<b>Bring your team.</b>}
      picture={
        <div ref={picture} className="sb-picture sb-picture--full">
          <Stage<Beat>
            width={width}
            height={200}
            initial={before}
            poster={after}
            play="once"
            script={beat(2)}
            theme={theme}
            className="sb-stage"
          >
            {(s) => (
              <div className="sb-invite">
                <div className="sb-invite-row">
                  <Field value="maya@studio.co" chip className="sb-field" />
                  <span className="sb-role">
                    <Text>Editor</Text>
                    <Icon name="chevron-down" size={14} />
                  </span>
                </div>
                <div className="sb-invite-foot">
                  <Facepile names={["Lokendra", "Jon"]} size={22} />
                  <Button
                    variant="primary"
                    size="small"
                    icon={s.on ? <Icon name="check" size={12} /> : undefined}
                  >
                    {s.on ? "Invited" : "Invite"}
                  </Button>
                </div>
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Everyone sees every board in the team.
    </Tile>
  );
}

/* ---------------- Boards (object) ---------------- */

function Folder({ name, back }: { name?: string; back?: number }) {
  return (
    <div className="sb-folder" data-back={back || undefined}>
      <span className="sb-folder-tab">
        {name ? <Text>{name}</Text> : <Bar w={64} h={7} tone={3} />}
      </span>
      <span className="sb-folder-body">
        <span className="sb-folder-band" />
        {name ? (
          <span className="sb-folder-meta">
            <Text>3 links</Text>
            <Text className="sb-faint">2 images</Text>
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Boards() {
  const theme = useContext(PageTheme);
  return (
    <Tile
      area="boards"
      title={<b>A board per topic.</b>}
      picture={
        <div className="sb-picture sb-picture--small">
          <Stage<Beat>
            width={360}
            height={200}
            initial={before}
            poster={after}
            play="once"
            script={beat(3)}
            theme={theme}
            className="sb-stage"
          >
            {(s) => (
              <div className="sb-folders" data-on={s.on || undefined}>
                <Folder back={2} />
                <Folder back={1} />
                <Folder name="Weekend ideas" />
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Notes, links and images for one idea, in one place.
    </Tile>
  );
}

/* ---------------- Activity (component) ---------------- */

function Row({ name, did, when }: { name: string; did: string; when: string }) {
  return (
    <div className="sb-act">
      <Avatar name={name} size={22} />
      <span className="sb-act-text">
        <b>{name}</b> {did}
      </span>
      <Text className="sb-act-when">{when}</Text>
    </div>
  );
}

function Activity() {
  const theme = useContext(PageTheme);
  const [picture, width] = usePictureWidth();
  return (
    <Tile
      area="activity"
      title={<b>See who changed what.</b>}
      picture={
        <div ref={picture} className="sb-picture sb-picture--full">
          <Stage<Beat>
            width={width}
            height={200}
            initial={before}
            poster={after}
            play="once"
            script={beat(4)}
            theme={theme}
            className="sb-stage"
          >
            {(s) => (
              <div className="sb-acts">
                <Collapse open={s.on}>
                  <Row name="Maya" did="added a note" when="now" />
                </Collapse>
                <Row name="Jon" did="linked a folder" when="2h" />
                <div className="sb-act">
                  <Bar w={22} h={22} r={11} tone={2} />
                  <Bar w={128} h={6} tone={2} />
                  <Bar w={18} h={6} tone={2} />
                </div>
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Every add, edit and delete, with who and when.
    </Tile>
  );
}

export default function FeatureBento() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  return (
    <PageTheme.Provider value={theme}>
      <div className="stashr-bento" data-theme={theme}>
        <div className="sb-grid">
          <Links />
          <Write />
          <Team />
          <Boards />
          <Activity />
        </div>
      </div>
    </PageTheme.Provider>
  );
}
