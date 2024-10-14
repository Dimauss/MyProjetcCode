import { Channel } from '@gibme/asterisk-gateway-interface';

export enum CallState {
    Ringing,
    HangUp,
}

export interface MessageId {
    chat_id: number;
    message_id: number;
}

export interface CurrentCall {
    state: CallState;
    message_ids: MessageId[];
    start_at: Date;
    stop_at?: Date;
    call_result: CallResult;
    agiChannel?: Channel;
}

export enum CallAnswerStatus {
    None = 'None',
    OpenEntrance = 'OpenEntrance',
    OpenEntranceAndDoor = 'OpenEntranceAndDoor',
}

export interface CallResult {
    answer_status: CallAnswerStatus;
    answer_user_id?: number;
}

let currentCall: CurrentCall;

export function StartCall(channel: Channel) {
    console.log('StartCall: entering');

    if (currentCall?.state === CallState.Ringing) {
        console.warn('StartCall: Attempting to start a call while there is a ringing call');
    }
    currentCall = {
        state: CallState.Ringing,
        start_at: new Date(),
        agiChannel: channel,
    } as CurrentCall;

    return currentCall;
}

export function SetNotificationMessageIds(messageIds: MessageId[]) {
    console.log('SetNotificationMessageIds: entering');

    if (!currentCall) {
        console.warn('SetNotificationMessageIds: No call');
        return;
    }
    currentCall.message_ids = messageIds;
}

export function GetNotificationMessageIds() {
    console.log('GetNotificationMessageIds: entering');

    if (!currentCall) {
        console.warn('GetNotificationMessageIds: No call');
        return [];
    }
    return currentCall.message_ids;
}

export function SaveAnswer(callResult: CallResult) {
    console.log('SaveAnswer: entering');

    if (!currentCall) {
        console.warn('SaveAnswer: No call');
        return;
    }
    currentCall.call_result = callResult;
}

export function IsAnswerSaved() {
    if (!currentCall) {
        console.warn('IsAnswerSaved: No call');
        return;
    }
    return (
        currentCall.call_result?.answer_status === CallAnswerStatus.OpenEntrance ||
        currentCall.call_result?.answer_status === CallAnswerStatus.OpenEntranceAndDoor
    );
}

export function IsCallFinalized() {
    console.log('IsCallFinalized: entering');

    if (!currentCall) {
        console.warn('IsCallFinalized: No call');
        return;
    }
    return currentCall.state === CallState.HangUp;
}

export function IsCallInterrupted() {
    console.log('IsCallFinalized: entering');

    return !!currentCall && currentCall.state === CallState.Ringing;
}

export async function InterruptChannel() {
    console.log('InterruptChannel: entering');

    try {
        await currentCall.agiChannel?.break();
    } catch (err) {
        const message = err.message || '';
        console.error(`InterruptChannel Error: \n message: ${message} \n stack: ${err.stack}`);
    }
}

export function FinalizeCall() {
    console.log('FinalizeCall: entering');

    if (!currentCall) {
        console.warn('FinalizeCall: No call');
        return;
    }
    currentCall.agiChannel = null;
    currentCall.state = CallState.HangUp;
    currentCall.stop_at = new Date();
    if (!currentCall.call_result) {
        currentCall.call_result = { answer_status: CallAnswerStatus.None };
    }
}
