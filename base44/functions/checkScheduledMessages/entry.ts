import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get all pending messages
        const messages = await base44.asServiceRole.entities.ScheduledMessage.filter({
            status: 'pending'
        });

        const now = new Date();
        const updatedMessages = [];

        // Check each message to see if it's due
        for (const message of messages) {
            const scheduledTime = new Date(message.scheduled_time);
            
            // If the scheduled time has passed, update status to pending_user_action
            if (scheduledTime <= now) {
                await base44.asServiceRole.entities.ScheduledMessage.update(message.id, {
                    status: 'pending_user_action'
                });
                updatedMessages.push({
                    id: message.id,
                    contact_name: message.contact_name,
                    message: message.message,
                    scheduled_time: message.scheduled_time
                });
            }
        }

        return Response.json({
            success: true,
            updated_count: updatedMessages.length,
            messages: updatedMessages
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});