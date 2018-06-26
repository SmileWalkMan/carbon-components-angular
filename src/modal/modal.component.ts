import { ModalService } from "./modal.service";
import {
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	OnDestroy,
	Output,
	ElementRef,
	ViewChild
} from "@angular/core";
import {
	trigger,
	state,
	style,
	transition,
	animate
} from "@angular/animations";
import { cycleTabs } from "./../common/tab.service";


/**
 * Component to create modals for presenting content.
 *
 * Using a modal in your application requires `n-modal-placeholder` which would generally be
 * placed near the end of your app component template (app.component.ts or app.component.html) as:
 *
 * ```html
 * <n-modal-placeholder></n-modal-placeholder>
 * ```
 *
 * A more complete example for `Modal` is given as follows:
 *
 * Example modal definition:
 *
 * ```typescript
 * \@Modal()
 * \@Component({
 * 	selector: "app-sample-modal",
 * 	template: `
 *		<n-modal size="xl">
 * 			<n-modal-header (closeSelect)="closeModal()">Header text</n-modal-header>
 * 			<section class="modal-body">
 * 			<h1>Sample modal works.</h1>
 * 			<button class="btn--icon-link" nPopover="Hello there" title="Popover title" placement="right" appendToBody="false">
 * 				<n-icon icon="info" size="sm"></n-icon>
 * 			</button>
 * 			{{modalText}}
 * 			</section>
 * 			<n-modal-footer><button class="btn--primary cancel-button" (click)="closeModal()">Close</button></n-modal-footer>
 * 		</n-modal>`,
 * 	styleUrls: ["./sample-modal.component.scss"]
 * })
 * export class SampleModalComponent {
 * 	closeModal: any; // placeholder for the closeModal method provided by the Modal decorator
 * 	modalText: string;
 * 	constructor(private injector: Injector) {
 * 		this.modalText = this.injector.get("modalText");
 * 	}
 * }
 * ```
 *
 * Example of opening the modal:
 *
 * ```typescript
 * \@Component({
 *  selector: "app-modal-demo",
 *  template: `
 *   <button class="btn--primary" (click)="openModal('drill')">Drill-down modal</button>
 *   <n-modal-placeholder></n-modal-placeholder>`
 * })
 * export class ModalDemo {
 * 	openModal() {
 * 		this.modalService.create({component: SampleModalComponent, inputs: {modalText: "Hello universe."}});
 * 	}
 * }
 * ```
 *
 * @export
 * @class ModalComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
	selector: "n-modal",
	template: `
		<n-overlay (overlaySelect)="overlaySelected.emit()">
			<div [ngClass]="{
					'modal--sm': size === 'sm',
					'modal': size === 'default' || size === 'md',
					'modal--lg': size === 'lg',
					'modal--xl': size === 'xl',
					'modal--xxl': size === 'xxl',
					'modal--warning': modalType === 'warning',
					'modal--error': modalType === 'error'
				}"
				[@modalState]="modalState"
				role="main"
				aria-modal="true"
				tabindex="0"
				style="z-index:1;"
				#modal>
				<ng-content></ng-content>
			</div>
		</n-overlay>
	`,
	animations: [
		trigger("modalState", [
			// state("in", style({opacity: 1, transform: "translate(0, 0)"})),
			state("void", style({transform: "translate(0, 5%)", opacity: 0})),
			transition(":enter", [
				animate("200ms ease-in"),
			]),
			transition(":leave", [
				// style({opacity: 1, transform: "translate(0, 0"}),
				animate(200, style({transform: "translate(0, 5%)", opacity: 0}))
			])
		])
	]
})
export class ModalComponent implements OnInit, OnDestroy {
	/**
	 * Size of the modal to display.
	 * (size `"default"` is being deprecated as of neutrino v1.2.0, please use `"md"` instead)
	 * @type {"sm" | "md" | "default" | "lg" | "xl" | "xxl"}
	 * @memberof ModalComponent
	 */
	@Input() size = "xl";
	/**
	 * Classification of the modal.
	 * @type {"default" | "warning" | "error"}
	 * @memberof ModalComponent
	 */
	@Input() modalType = "default";
	/**
	 * Emits event when click occurs within `n-overlay` element. This is to track click events occuring outside bounds of the `Modal` object.
	 * @memberof ModalComponent
	 */
	@Output() overlaySelected = new EventEmitter();
	/**
	 * To emit the closing event of the modal window.
	 * @memberof ModalComponent
	 */
	@Output() close = new EventEmitter();
	/**
	 * Maintains a reference to the view DOM element of the `Modal`.
	 * @type {ElementRef}
	 * @memberof ModalComponent
	 */
	@ViewChild("modal") modal: ElementRef;

	/**
	 * Controls the transitions of the `Modal` component.
	 * @type {"in" | "out"}
	 * @memberof ModalComponent
	 */
	modalState = "out";

	/**
	 * Creates an instance of `ModalComponent`.
	 * @param {ModalService} modalService
	 * @memberof ModalComponent
	 */
	constructor(public modalService: ModalService) {}

	/**
	 * Set document focus to be on the modal component when it is initialized.
	 * @memberof ModalComponent
	 */
	ngOnInit() {
		this.modalState = "in";
		this.modal.nativeElement.focus();
	}

	/**
	 * Emit the close event when the modal component is destroyed.
	 * @memberof ModalComponent
	 */
	ngOnDestroy() {
		this.modalState = "out";
		this.close.emit();
	}

	/**
	 * Handle keyboard events to close modal and tab through the content within the modal.
	 * @param {KeyboardEvent} event
	 * @memberof ModalComponent
	 */
	@HostListener("keydown", ["$event"])
	handleKeyboardEvent(event: KeyboardEvent) {
		switch (event.key) {
			case "Escape": {
				event.stopImmediatePropagation();  // prevents events being fired for multiple modals if more than 2 open
				this.modalService.destroy();  // destroy top (latest) modal
				break;
			}

			case "Tab": {
				cycleTabs(event, this.modal.nativeElement);
				break;
			}
		}
	}
}
