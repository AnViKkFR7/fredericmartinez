import Markdown from "react-markdown";

export default function BlogBody({ body }: { body: string }) {
  return <div className="blog-body"><Markdown skipHtml disallowedElements={["h1"]} unwrapDisallowed>{body}</Markdown></div>;
}
