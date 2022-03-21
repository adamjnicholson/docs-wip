import {
	json,
	Link,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "remix";
import type { MetaFunction } from "remix";
import { buildFileTreeFromFilefilePaths } from "./lib/posts.server";
import React from "react";

export const loader = async () => {
	const repoUrl =
		"https://api.github.com/repos/remix-run/remix/git/trees/main?recursive=1";
	const repoFiles = await fetch(repoUrl)
		.then((res) => res.json())
		.then((body) => body);

	const isMdFileRegExp = new RegExp(/^docs\/.*\.md$/);
	const mdFiles = repoFiles.tree.filter((fileObj) =>
		isMdFileRegExp.test(fileObj.path)
	);

	const fileTree = buildFileTreeFromFilefilePaths(
		mdFiles.map((fileObj) => fileObj.path)
	);

	return json(
		{ fileTree },
		{
			headers: {
				"Cache-Control": "max-age=604800",
			},
		}
	);
};

export const meta: MetaFunction = () => {
	return { title: "New Remix App" };
};

type Folder = {
	name: string;
	children: Folder[];
};

function NestedNav({ folders }: { folders: Folder[] }) {
	if (!folders) {
		return null;
	}

	return (
		<>
			{folders.map((folder) => {
				const isFolder = folder.children.length > 0;

				return (
					<li key={folder.name}>
						{isFolder ? (
							<>
								<span>{folder.name}</span>
								<ul>
									<NestedNav
										folders={folder.children.map(
											(childFolder) => ({
												...childFolder,
												name: `${folder.name}/${childFolder.name}`,
											})
										)}
									/>
								</ul>
							</>
						) : (
							<Link to={`/${folder.name}`}>
								{folder.name.split("/").slice(-1)[0]}
							</Link>
						)}
					</li>
				);
			})}
		</>
	);
}

export default function App() {
	const { fileTree } = useLoaderData();

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<div style={{ display: "flex" }}>
					<nav style={{ flexBasis: "25%" }}>
						<ul>
							<NestedNav folders={fileTree[0].children} />
						</ul>
					</nav>
					<main>
						<Outlet />
						<ScrollRestoration />
						<Scripts />
						<LiveReload />
					</main>
				</div>
			</body>
		</html>
	);
}
