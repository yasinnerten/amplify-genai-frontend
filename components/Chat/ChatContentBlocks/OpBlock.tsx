
import {useContext, useEffect, useState} from "react";
import HomeContext from "@/pages/api/home/home.context";
import {IconRobot} from "@tabler/icons-react";
import styled, {keyframes} from "styled-components";
import {FiCommand} from "react-icons/fi";
import ExpansionComponent from "@/components/Chat/ExpansionComponent";
import {createAssistant, listAssistants} from "@/services/assistantService";
import { useSession } from "next-auth/react"
import {AssistantDefinition, AssistantProviderID} from "@/types/assistant";
import {Prompt} from "@/types/prompt";
import {Conversation} from "@/types/chat";
import {getPrompts, savePrompts} from "@/utils/app/prompts";
import { syncAssistants} from "@/utils/app/assistants";
import { getFolders } from "@/utils/app/folders";


const animate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(720deg);
  }
`;

const LoadingIcon = styled(FiCommand)`
  color: lightgray;
  font-size: 1rem;
  animation: ${animate} 2s infinite;
`;


interface OpProps {
    definition: string;
}



function parseStringWithPrefixes(inputString: string): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    const lines = inputString.split('\n');
    let currentPrefix: string | null = null;
    let currentValue: string = '';

    for (const line of lines) {
        const prefixMatch = line.match(/^(\w+):\s*(.*)/);
        if (prefixMatch) {
            if (currentPrefix !== null) {
                if (result[currentPrefix]) {
                    if (Array.isArray(result[currentPrefix])) {
                        // @ts-ignore
                        result[currentPrefix].push(currentValue.trim());
                    } else {
                        // @ts-ignore
                        result[currentPrefix] = [result[currentPrefix], currentValue.trim()];
                    }
                } else {
                    result[currentPrefix] = currentValue.trim();
                }
            }
            currentPrefix = prefixMatch[1];
            currentValue = prefixMatch[2];
        } else {
            currentValue += '\n' + line.trim();
        }
    }

    if (currentPrefix !== null) {
        if (result[currentPrefix]) {
            if (Array.isArray(result[currentPrefix])) {
                (result[currentPrefix] as string[]).push(currentValue.trim());
            } else {
                (result[currentPrefix] as string[]) = [(result[currentPrefix] as string), currentValue.trim()];
            }
        } else {
            result[currentPrefix] = currentValue.trim();
        }
    }

    return result;
}


const OpBlock: React.FC<OpProps> = ({definition}) => {
    const [error, setError] = useState<string | null>(null);
    const [isIncomplete, setIsIncomplete] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [op, setOp] = useState<any>({});

    const {state:{selectedConversation, conversations, prompts}, dispatch:homeDispatch} = useContext(HomeContext);
    const { data: session } = useSession();
    const user = session?.user;

    const getDocumentsInConversation = (conversation?:Conversation) => {
        if(conversation){
            // Go through every message in the conversation and collect all of the
            // data sources that are in the data field of the messages
            return conversation.messages.filter( m => {
                return m.data && m.data.dataSources
            })
                .flatMap(m => m.data.dataSources);
        }

        return [];
    }


    const parseOp = (definitionStr: string) => {

        try {

            let op = parseStringWithPrefixes(definitionStr);

            const rawDS = getDocumentsInConversation(selectedConversation);
            const knowledge = rawDS.map(ds => {
                if(ds.key || (ds.id && ds.id.indexOf("://") > 0)){
                    return ds;
                }
                else {
                    return {
                        ...ds,
                        id: "s3://"+ds.id
                    }
                }
            });

            op._dataSources = knowledge;

            return op;
        } catch (e) {
            setIsIncomplete(true);
            return {
            };
        }
    }



    const handleDoOp = async () => {

        if(user?.email && op) {

            setLoadingMessage("Working on it...");
            setIsLoading(true);

            try {

            } catch (e) {
                alert("Something went wrong. Please try again.");
            }

            setLoadingMessage("");
            setIsLoading(false);
        }
    }

    const {
        state: {messageIsStreaming},
    } = useContext(HomeContext);


    useEffect(() => {
        if(!messageIsStreaming) {
            const op = parseOp(definition);

            if(op) {
                setIsIncomplete(false);
            }
            setOp(op);
            setIsLoading(false);
        }
    }, [messageIsStreaming]);

    let dataSources = getDocumentsInConversation(selectedConversation);

    // @ts-ignore
    return error ?
        <div>{error}</div> :
        isIncomplete ? <div>We are still missing some details...</div> :
            <div style={{maxHeight: "450px"}}>
                {isLoading ? (
                    <div className="flex flex-row items-center"><LoadingIcon/> <div className="ml-2">{loadingMessage}</div></div>
                ) : (
                    <>
                        <div className="flex flex-col w-full mb-4">
                            <div className="flex flex-row items-center justify-center">
                                <div className="mr-2"><IconRobot size={30} /></div>
                                <div className="text-2xl font-bold">Plan</div>
                            </div>
                            {Object.entries(op).map(([key, value], index) => {
                                return <ExpansionComponent key={index} title={key} content={
                                    <div className="text-sm text-gray-500">{JSON.stringify(value)}</div>
                                }/>
                            })}
                            <button className="mt-4 w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-green-600"
                                    onClick={handleDoOp}
                            >
                                Execute
                            </button>
                        </div>
                    </>
                )}
            </div>;
};

export default OpBlock;

