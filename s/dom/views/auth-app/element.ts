
import {html, loading} from "@benev/slate"

import {nexus} from "../../nexus.js"
import stylesCss from "./styles.css.js"
import {Authcore} from "../../../auth/core.js"
import {Identity} from "../../../auth/types.js"
import {Situation} from "../../logic/situation.js"
import {EgressPage} from "../pages/egress/view.js"
import {svgSlate} from "../../../tools/svg-slate.js"
import {ListView} from "../../views/pages/list/view.js"
import {EditView} from "../../views/pages/edit/view.js"
import {CreateView} from "../../views/pages/create/view.js"
import {DeleteView} from "../../views/pages/delete/view.js"
import {syllabicName} from "../../../tools/random-names.js"
import {determinePurpose} from "../../logic/determine-purpose.js"

import shieldOffIcon from "../../icons/tabler/shield-off.icon.js"
import shieldCheckFilledIcon from "../../icons/tabler/shield-check-filled.icon.js"

export const AuthApp = nexus.shadowComponent(use => {
	use.styles(stylesCss)

	const {authcore, storagePersistence} = use.context
	const purpose = use.once(determinePurpose)
	const situationOp = use.op<Situation.Any>()
	use.once(() => storagePersistence.check())

	function gotoList() {
		situationOp.load(async() => ({
			kind: "list",
			authcore,
			onEdit: gotoEdit,
			onCreate: gotoCreate,
			onEgress: identities => gotoEgress(identities, gotoList),
		}))
	}

	async function gotoCreate() {
		const name = syllabicName()
		const identity = await Authcore.generateIdentity(name)
		situationOp.load(async() => ({
			kind: "create",
			identity,
			onCancel: gotoList,
			onComplete: identity => {
				authcore.add(identity)
				storagePersistence.request()
				gotoList()
			},
		}))
	}

	function gotoEdit(identity: Identity) {
		situationOp.load(async() => ({
			kind: "edit",
			identity,
			onCancel: gotoList,
			onDelete: gotoDelete,
			onComplete: identity => {
				authcore.add(identity)
				storagePersistence.request()
				gotoList()
			},
		}))
	}

	function gotoDelete(identity: Identity) {
		situationOp.load(async() => ({
			kind: "delete",
			identity,
			onCancel: gotoList,
			onComplete: identity => {
				authcore.delete(identity)
				storagePersistence.request()
				gotoList()
			},
		}))
	}

	function gotoEgress(identities: Identity[], onBack: () => void) {
		situationOp.load(async() => ({
			kind: "egress",
			identities,
			onBack,
		}))
	}

	use.once(gotoList)

	const page = loading.braille(situationOp, situation => {switch (situation.kind) {

		case "list":
			return ListView([situation, purpose])

		case "create":
			return CreateView([situation])

		case "edit":
			return EditView([situation])

		case "delete":
			return DeleteView([situation])

		case "egress":
			return EgressPage([situation])

		default:
			throw new Error("unknown situation")
	}})

	return html`
		${page}

		<footer>
			${storagePersistence.persisted.value ? html`
				<div class=persistence data-is-persisted>
					${svgSlate(shieldCheckFilledIcon)}
					<span>Persistence enabled</span>
				</div>
			` : html`
				<button class=persistence @click="${() => storagePersistence.request()}">
					${svgSlate(shieldOffIcon)}
					<span>Persistence disabled</span>
				</button>
			`}
		</footer>
	`
})

