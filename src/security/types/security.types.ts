export type DeviceSession = {
    deviceId: string
    userId: string
    ip: string
    title: string
    lastActiveDate: string
    expiresAt: Date
}

export type DeviceViewModel = {
    ip: string
    title: string
    lastActiveDate: string
    deviceId: string
}
