import { Button } from "@heroui/button";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@heroui/react";
import { RxAvatar } from "react-icons/rx";
import { AuthForm } from "./auth-form";
import { useUserContext } from "@/context/user-context";

export const AuthModal = () => {
    const { userData, onLogout } = useUserContext();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return userData.id ? (
        <span className="flex">
            <RxAvatar size={32} className="mt-1 text-secondary-500" />
            <Button onPress={onLogout} className="mt-0 ml-1" variant="light">
                Logout
            </Button>
        </span>
    ) : (
        <>
            <span className="flex">
                {/* <RxAvatar size={32} className="mt-1" /> */}
                <Button onPress={onOpen} className="mt-0 ml-1" variant="light">
                    Login
                </Button>
            </span>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Account</ModalHeader>
                            <ModalBody>
                                <AuthForm />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Action
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
