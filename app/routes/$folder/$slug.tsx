import * as React from "react";

import { getPostData } from "../../lib/posts.server";
import { json, Link, LoaderFunction, useLoaderData } from "remix";
import { getMDXComponent } from "mdx-bundler/client";

function getAnchor(text: string) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, "")
		.replace(/[ ]/g, "-");
}

const H2 = ({ children }: { children?: React.ReactNode }) => {
	const anchor = getAnchor(typeof children === "string" ? children : "");
	const link = `#${anchor}`;
	return (
		<h2 id={anchor}>
			<Link to={{ hash: link }} className="anchor-link">
				#
			</Link>
			{children}
		</h2>
	);
};

const H3 = ({ children }: { children?: React.ReactNode }) => {
	const anchor = getAnchor(typeof children === "string" ? children : "");
	const link = `#${anchor}`;
	return (
		<h3 id={anchor}>
			<a href={link} className="anchor-link">
				#
			</a>
			{children}
		</h3>
	);
};

// https://raw.githubusercontent.com/remix-run/remix/main/docs/api/conventions.md
// https://raw.githubusercontent.com/remix-run/react-router/main/docs/getting-started/concepts.md
// https://raw.githubusercontent.com/remix-run/history/dev/docs/api-reference.md

export const loader: LoaderFunction = async ({ params }) => {
	const fileUrl = `https://raw.githubusercontent.com/remix-run/remix/main/docs/${params.folder}/${params.slug}`;
	const post = await getPostData(fileUrl);

	return json(post, {
		headers: {
			"Cache-Control": "max-age=604800",
		},
	});
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export default function Slug() {
	const { post, contentsTable } =
		useLoaderData<Awaited<ReturnType<typeof getPostData>>>();

	const { code } = post;

	const Component = React.useMemo(() => getMDXComponent(code), [code]);
	return (
		<div style={{ display: "flex" }}>
			<div>
				<Component components={{ h2: H2, h3: H3 }} />
			</div>
			<aside
				style={{
					position: "sticky",
					top: "20px",
					flexBasis: "25%",
					alignSelf: "flex-start",
				}}
			>
				<h3>Table of contents</h3>
				{contentsTable?.length ? (
					<nav>
						<ul>
							{contentsTable.map(({ h2, h3 }) => (
								<li key={h2}>
									<Link
										to={{
											hash: `#${getAnchor(h2)}`,
										}}
									>
										{h2}
									</Link>
									{h3.length ? (
										<ul>
											{h3.map((heading) => (
												<li key={heading}>
													<Link
														to={{
															hash: `#${getAnchor(
																heading
															)}`,
														}}
													>
														{heading}
													</Link>
												</li>
											))}
										</ul>
									) : null}
								</li>
							))}
						</ul>
					</nav>
				) : null}
			</aside>
		</div>
	);
}

export function ErrorBoundary() {
	return (
		<>
			<h1>Whoops!</h1>
			<p>
				This page is probably broken due to trying to render a custom
				component specified in the remix docs. Since we don't own these
				docs we can't control what JSX rendered. Once these render our
				own docs we can have control over the JSX and this error
				shouldn't happen
			</p>
			<p>Please choose a different doc</p>
		</>
	);
}
