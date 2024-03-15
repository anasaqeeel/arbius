import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"

@Entity_()
export class ContestationVoteFinish {
    constructor(props?: Partial<ContestationVoteFinish>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    network!: string

    @Index_()
    @Column_("int4", {nullable: false})
    block!: number

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date

    @Index_()
    @Column_("text", {nullable: false})
    taskID!: string

    @Index_()
    @Column_("int4", {nullable: false})
    startIndex!: number

    @Index_()
    @Column_("int4", {nullable: false})
    endIndex!: number

    @Index_()
    @Column_("text", {nullable: false})
    txHash!: string
}
