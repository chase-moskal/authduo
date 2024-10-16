
import {Authcore} from "../../auth/core.js"
import {Identity, IdentityFile} from "../../auth/types.js"

export namespace Situation {
	export type List = {
		kind: "list"
		authcore: Authcore
		onCreate: () => void
		onEdit: (identity: Identity) => void
		onEgress: (identities: Identity[]) => void
		onIngress: (file: IdentityFile | undefined) => void
	}

	export type Create = {
		kind: "create"
		identity: Identity
		onCancel: () => void
		onComplete: (identity: Identity) => void
	}

	export type Edit = {
		kind: "edit"
		identity: Identity
		onCancel: () => void
		onDelete: (identity: Identity) => void
		onComplete: (identity: Identity) => void
	}

	export type Delete = {
		kind: "delete"
		identity: Identity
		onCancel: () => void
		onComplete: (identity: Identity) => void
	}

	export type Egress = {
		kind: "egress"
		identities: Identity[]
		onBack: () => void
	}

	export type Ingress = {
		kind: "ingress"
		file: IdentityFile | undefined
		onBack: () => void
		onAddIdentities: (identities: Identity[]) => void
	}

	////////////////////////////////

	export type Any = List | Create | Edit | Delete | Egress | Ingress
}

