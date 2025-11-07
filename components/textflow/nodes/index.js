// components/textflow/nodes/index.js
import StartNode from "./StartNode";
import TriggerNode from "./TriggerNode";
import HttpNode from "./HttpNode";
import LlmNode from "./LlmNode";
import TransformNode from "./TransformNode";
import ConditionalNode from "./ConditionalNode";
import ParallelNode from "./ParallelNode";
import WaitNode from "./WaitNode";
import SubflowNode from "./SubflowNode";

export const nodeTypes = {
  start: StartNode,
  trigger: TriggerNode,
  http: HttpNode,
  llm: LlmNode,
  transform: TransformNode,
  conditional: ConditionalNode,
  parallel: ParallelNode,
  wait: WaitNode,
  subflow: SubflowNode,
};