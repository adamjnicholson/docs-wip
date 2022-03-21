import { Outlet } from "remix";

export default function Folder() {
	return (
		<>
			<h1>Docs</h1>
			<Outlet />
		</>
	);
}
