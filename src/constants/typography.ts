import { normalizeFont } from "../utils/normalizeFonts";

export const TYPOGRAPHY = {
    LARGE_TITLE: {
        fontFamily: 'Poppins-Bold',
        fontSize: normalizeFont(48),
    },
    MAIN_TITLE: {
        fontFamily: 'Poppins-Medium',
        fontSize: normalizeFont(32),
    },
    TITLE: {
        fontFamily: 'Poppins-Medium',
        fontSize: normalizeFont(24),
    },
    HEADLINE: {
        fontFamily: 'Poppins-Normal',
        fontSize: normalizeFont(20),
    },
    SUB_HEADLINE: {
        fontFamily: 'Poppins-Medium',
        fontSize: normalizeFont(16),
    },
    BODY: {
        fontFamily: 'Poppins-Regular',
        fontSize: normalizeFont(14),
    },
    TAGS: {
        fontFamily: 'Poppins-Regular',
        fontSize: normalizeFont(10),
    },
    CTA: {
        fontFamily: 'Poppins-Medium',
        fontSize: normalizeFont(12),
    },
}