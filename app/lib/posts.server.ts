import { bundleMDX } from "mdx-bundler";

function buildTableOfContents(source: string) {
	// Look for 2 or 3 # that start on a new line which is then followed by a space
	// match the above with all other characters until a new line is found
	const headings = source.match(/\n###?\s.*\n/g);

	return headings?.reduce<{ h2: string; h3: string[] }[]>((toc, heading) => {
		const level = heading.slice(0, 4) === "\n###" ? 3 : 2;

		// Remove \n, hashes and the space following the hashes
		const headingText = heading.replace(/(^\n###?\s|\n$)/gm, "");

		if (level === 2) {
			return [...toc, { h2: headingText, h3: [] }];
		}

		const tocCopy = [...toc];
		tocCopy.pop();
		const { h2, h3 } = toc[toc.length - 1];

		return [...tocCopy, { h2, h3: [...h3, headingText] }];
	}, []);
}

export async function getPostData(fileUrl: string) {
	const res = await fetch(fileUrl);
	const json = await res.text();

	const { code, frontmatter } = await bundleMDX({ source: json });

	return {
		post: {
			slug: fileUrl.split("/").slice(-1)[0],
			frontmatter,
			code,
		},
		contentsTable: buildTableOfContents(json),
	};
}

type Result = {
	name: string;
	children: Result[];
};

export function buildFileTreeFromFilefilePaths(filePaths: string[]) {
	let result: Result["children"] = [];
	let level = { result };

	function reducer(accumulator: any, currentValue: string) {
		//If we already have an entry for this in the accumulator, we can just return it
		//Then, the next iteration of `currentValue` is known to be a child of this entry.
		if (accumulator[currentValue]) {
			return accumulator[currentValue];
		}

		//Otherwise, let's add this entry and then return it, again the next iteration
		//is going to be a child of this entry.

		accumulator[currentValue] = {
			result: [],
		};

		//Note: everything in the accumulator is eventually discarded - we only care about the `result` which we are
		//continuously building from the ground up using references.

		let el: Result = {
			name: currentValue,
			children: accumulator[currentValue].result,
		};

		//push the current element to `result`, which is equal to the precedening element (parents) children. (??)
		accumulator.result.push(el);

		return accumulator[currentValue];
	}

	filePaths.forEach((path) => {
		let pathParts = path.split("/");

		//The accumulator will take the initial value of `level`
		pathParts.reduce(reducer, level);
	});

	return result;
}
