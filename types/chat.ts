import { OpenAIModel } from './openai';
import {Prompt} from "@/types/prompt";
import { v4 as uuidv4 } from 'uuid';
import {WorkflowDefinition} from "@/types/workflow";

export interface Message {
  role: Role;
  content: string;
  id: string;
  type: string | undefined;
  data: any | undefined;
  label?: string;
  codeInterpreterMessageData?: any | undefined
}

export enum MessageType {
  PROMPT = 'prompt',
  AUTOMATION = 'automation',
  ROOT = 'root_prompt',
  PREFIX_PROMPT = 'prefix_prompt',
  FOLLOW_UP = 'follow_up',
  REMOTE = 'remote',
  OUTPUT_TRANSFORMER = 'output_transformer',
}

export const newMessage = (data: any) => {
  return {
    role: "user",
    content: "",
    type: MessageType.PROMPT,
    data: {},
    ...data,
    id: uuidv4(),
  }
}

export type Role = 'assistant' | 'user';

export type CustomFunction = {
  name: string;
  description: string;
  parameters: JsonSchema;
}

export interface JsonSchema {
  $schema?: string;
  $ref?: string;
  title?: string;
  description?: string;
  default?: any;
  examples?: any[];
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalItems?: boolean | JsonSchema;
  items?: JsonSchema | JsonSchema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  definitions?: { [key: string]: JsonSchema };
  properties?: { [propertyName: string]: JsonSchema };
  patternProperties?: { [key: string]: JsonSchema };
  dependencies?: { [key: string]: JsonSchema | string[] };
  enum?: any[];
  type?: string | string[];
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
}

export interface ChatResponseFormat {
    type: string;
}

export interface DataSource {
    id: string;
    type?: string;
    metadata?: any;
    name?: string;
}

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  prompt: string;
  temperature: number;
  functions?: CustomFunction[];
  function_call?: string;
  response_format?: ChatResponseFormat;
  dataSources?: DataSource[];
  accountId?: string;
  requestId?: string;
  endpoint?: string;
  maxTokens?: number;
  [key: string]: any;
  codeInterpreterAssistantId?: string;

}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  folderId: string | null;
  promptTemplate: Prompt | null;
  tags?: string[]
  maxTokens?: number;
  workflowDefinition?: WorkflowDefinition;
  data?: {[key:string]:any}
  codeInterpreterAssistantId?: string;
}
